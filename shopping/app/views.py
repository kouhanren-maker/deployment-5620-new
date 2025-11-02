import os
import requests
from django.db import transaction, IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .auth_decorators import admin_required, merchant_required

from .serializers import RegisterSerializer, LoginSerializer
from .auth_utils import create_jwt_for_user, authenticate_credentials, get_token_from_request
from .auth_decorators import jwt_required, admin_required, customer_required, merchant_required
from django.http import JsonResponse

from .models import (
    User, UserDialogue, Merchant, MerchantHotProduct, ProductUserPortrait,
    Customer, Product, Attribute, CustomerPreference, BlacklistedToken
)
AI_AGENT_URL = os.getenv("AI_AGENT_URL", "http://127.0.0.1:9000/agent")

from pathlib import Path
import json




# test
@api_view(["GET"])
@permission_classes([AllowAny])
def hello_view(request):

    return Response({"text": "Hello World:)"}, status=status.HTTP_201_CREATED)


# -------------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def save_customer_preferences(request, user_id: int):
    """
    POST /api/customer/<user_id>/preferences/
    Body:
    {
      "preference": "I like red shoes"   # 也兼容 "preferences"
    }
    作用：将用户的一句偏好文本落库到 customer_preferences 表。
    规则：同一个 Customer 只有一条偏好，已存在则更新（update_or_create）。
    """

    # 1) 校验用户
    user = get_object_or_404(User, id=user_id)
    if getattr(user, "role", "").lower() != "customer":
        return Response({"error": "Customer privileges required"}, status=status.HTTP_403_FORBIDDEN)

    # 2) 取偏好文本（兼容两个 key）
    pref_text = (request.data.get("preference")
                 or request.data.get("preferences")
                 or "").strip()
    if not pref_text:
        return Response({"detail": "preference text is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 可选：限制长度，避免异常超长输入
    if len(pref_text) > 2000:
        pref_text = pref_text[:2000]

    # 3) 找到（或创建）该用户对应的 Customer 记录
    #    如果你的 Customer 表确定存在 user 外键（常见），用 user_id 关联即可
    with transaction.atomic():
        customer = Customer.objects.filter(user_id=user.id).first()
        if customer is None:
            # 如果你的业务必须先建 Customer，这里兜底创建一条最小记录
            # 若不允许自动创建，可改成直接 404
            customer = Customer.objects.create(user_id=user.id)

        # 4) 写入/更新 CustomerPreference（以 customer 唯一）
        cp, created = CustomerPreference.objects.update_or_create(
            customer=customer,
            defaults={
                "preference": pref_text,
                # 如果你的表由 DB 触发器维护时间戳，这两行可省略
                "update_time": timezone.now(),
                "create_time": timezone.now()
            }
        )

    return Response({
        "message": "Preference saved successfully",
        "created": created,  # True=新建，False=更新
        "data": {
            "id": cp.id,
            "customer_id": cp.customer_id,
            "preference": cp.preference,
            "create_time": getattr(cp, "create_time", None),
            "update_time": getattr(cp, "update_time", None),
        }
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

# -------------------------------------------------------------------------------

# Register
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/register
    Body: { "email": "...", "password": "...", "role": "customer" }
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"id": user.id, "email": user.email, "role": user.role}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/login
    Body: { "email": "...", "password": "..." }
    Returns: { "token": "jwt..." }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    user = authenticate_credentials(email, password)
    if user is None:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    token = create_jwt_for_user(user)
    return Response({"token": token, "user": {"id": user.id, "email": user.email, "role": user.role}})

# Admin endpoint
@api_view(["GET"])
@admin_required
def list_users_view(request):
    """
    GET api/admin/list_users
    Headers: 
            Key: Authorization
            Value: Bearer <token>
    """
    users = User.objects.all().values("id", "email", "role", "create_time")
    return JsonResponse({"users": list(users)}, safe=False)


# Log out
@api_view(["POST"])
@jwt_required
def logout_view(request):
    """
    POST /api/logout/
    Headers:
        Authorization: Bearer <token>
    """
    token = get_token_from_request(request)
    if not token:
        return Response({"error": "Token missing"}, status=400)

    # Add token to blacklist
    BlacklistedToken.objects.get_or_create(token=token)

    return Response({"message": "Successfully logged out"}, status=200)

# -------------------------------------------------------------------------------

# Merchant function: season hot products report
@api_view(["POST"])
@merchant_required
def generate_merchant_report(request, user_id ): 

    """
    POST api/merchant/report/<user_id>/
    Body:
        {
            "query": "Show me top products for Autumn 2025"
        }

    This endpoint:
    1. Logs the merchant query into UserDialogue.
    2. Loads a mock AI response from mock/merchant_query.json.
    3. Saves hot product info into MerchantHotProduct table.
    4. Returns a seasonal report.
    """

    # check if user a merchant (path variable)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": f"User {user_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    if user.role.lower() != "merchant":
        return Response({"error": "Merchant privileges required"}, status=status.HTTP_403_FORBIDDEN)
    

    # 1. extract query
    query = (request.data.get("query") or "").strip()
    if not query:
        return Response({"detail": "query is required"}, status=status.HTTP_400_BAD_REQUEST)

    print("User query:", query)

    # 2. create dialogue record
    dialogue = UserDialogue.objects.create(
        user_id=user_id,
        question=query,
        answer="",           
    )

    # Step 2️⃣: 请求 AI-Agent
    try:
        ai_response = requests.post(
            AI_AGENT_URL,
            json={"text": query},
            timeout=60,
        )
        ai_response.raise_for_status()
    except requests.RequestException as e:
        return Response({"detail": f"AI-Agent error: {e}"}, status=status.HTTP_502_BAD_GATEWAY)

    try:
        ai_data = ai_response.json()
    except ValueError:
        return Response({"detail": "AI-Agent returned invalid JSON"}, status=status.HTTP_502_BAD_GATEWAY)


    # # 3. mock AI response with 3-hottest products in the season
    # local_path = Path(__file__).resolve().parent / "mock" / "merchant_query.json"
    # try:
    #     with open(local_path, "r", encoding="utf-8") as f:
    #         ai_data = json.load(f)
    # except FileNotFoundError:
    #     return Response({"detail": f"data.json not found: {local_path}"}, status=status.HTTP_400_BAD_REQUEST)
    # except json.JSONDecodeError as e:
    #     return Response({"detail": f"data.json invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)

    print("at response:", ai_data)

    # 4. parse AI response
    facts = ai_data.get("facts", {})
    quarter = facts.get("quarter", "")
    products_payload = facts.get("top_products", [])
    answer = ai_data.get("answer", "")

    if not isinstance(products_payload, list):
        return Response({"detail": "Invalid products format: products must be a list"},
                        status=status.HTTP_400_BAD_REQUEST)

    # 5. Save into DB (atomic transaction)
    saved_products = []
    with transaction.atomic():
        for p in products_payload:
            prod = MerchantHotProduct.objects.create(
                rank=p.get(("rank") or 0),
                name=p.get(("name") or "")[:50],
                category=p.get(("category") or "")[:200],
                price=float(p.get("price", 0)),
                sales=int(p.get("sales", 0)),
                quarter=quarter,
            )

            saved_products.append({
                "id": prod.id,
                "rank": prod.rank,
                "name": prod.name,
                "category": prod.category,
                "price": prod.price,
                "sales": prod.sales,
            })

        # Update dialogue answer
        dialogue.answer = answer
        dialogue.save(update_fields=["answer", "update_time"])

    # 6. return response
    return Response(
        {
            "data": {
                "quarter": quarter,
                "products": saved_products,
                "answer": answer,
            },
            "response": {
                "ok": True,
                "saved_count": len(saved_products),
            }
        },
        status=status.HTTP_200_OK,
    )


# -------------------------------------------------------------------------------

@api_view(["POST"])
@jwt_required
# @permission_classes([AllowAny])
def process_customer_data(request, user_id: int):
    """
    1) 查 user_id 的历史对话，组装 history
    2) 查 CustomerPreference.preference 作为 preference
    3) 调用 AI-Agent: 发送 {text, preference, history}
    4) 解析 AI 返回（兼容 items / product / products，及 data 包裹）
    5) 只落库：name, link->source, price（以 source 为唯一键 upsert）
    6) 回填 dialogue.answer
    7) 返回给前端：{ data: { product:[{id,name,source,price}], answer }, response:{...} }
    """

    # ---- 入参校验 ----
    question = (request.data.get("question") or "").strip()
    if not question:
        return Response({"detail": "question is required"}, status=status.HTTP_400_BAD_REQUEST)

    # ---- Step 1: 历史对话 ----
    history_qas = list(
        UserDialogue.objects.filter(user_id=user_id)
        .order_by("create_time")
        .values("question", "answer")
    )
    history = [{"question": q["question"], "answer": q["answer"]} for q in history_qas]

    dialogue = UserDialogue.objects.create(
        user_id=user_id,
        question=question,
        answer="",  # 先空着，成功后回填
    )

    # ---- Step 1.5: 用户偏好（取该用户最新一条非空 preference）----
    preference = (
        CustomerPreference.objects
        .filter(customer_id=user_id)
        .exclude(preference__isnull=True)
        .exclude(preference__exact="")
        .order_by("-id")                # 若表里有 update_time，也可改为 .order_by("-update_time", "-id")
        .values_list("preference", flat=True)
        .first()
        or ""
    )

    # ---- Step 2: 请求 AI-Agent ----
    payload = {
        "text": question,
        "preference": preference,
        "history": history,
    }


    try:
        ai_response = requests.post(
            AI_AGENT_URL,
            json=payload,
            timeout=60,
        )
        ai_response.raise_for_status()
    except requests.RequestException as e:
        return Response({"detail": f"AI-Agent error: {e}"}, status=status.HTTP_502_BAD_GATEWAY)

    try:
        ai_data = ai_response.json()
    except ValueError:
        return Response({"detail": "AI-Agent returned invalid JSON"}, status=status.HTTP_502_BAD_GATEWAY)
    print(ai_data)
    # ---- Step 3: 解析返回 ----
    # 兼容：直接顶层 or 包在 data 里
    # ---- Step 3: 解析返回（稳健版）----

    # ---- Step 3: 解析返回（优先取有 name 的 product/products）----
    def extract_items_with_name_first(payload: dict):
        if not isinstance(payload, dict):
            return []

        # 1) 优先：顶层 product/products
        for key in ("product", "products"):
            arr = payload.get(key)
            if isinstance(arr, list) and arr:
                return arr

        # 2) data.* 里的 product/products
        data = payload.get("data")
        if isinstance(data, dict):
            for key in ("product", "products"):
                arr = data.get(key)
                if isinstance(arr, list) and arr:
                    return arr

        # 3) 最后：facts.items（通常没有 name）
        facts = payload.get("facts")
        if isinstance(facts, dict) and isinstance(facts.get("items"), list):
            return facts["items"]

        # 4) 兜底：顶层 items / data.items
        if isinstance(payload.get("items"), list):
            return payload["items"]
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data["items"]

        return []

    items = extract_items_with_name_first(ai_data)

    # answer：data.answer 优先，其次顶层 answer
    answer = ""
    if isinstance(ai_data.get("data"), dict) and "answer" in ai_data["data"]:
        answer = ai_data["data"]["answer"]
    elif "answer" in ai_data:
        answer = ai_data["answer"]

    if not isinstance(items, list):
        return Response({"detail": "Invalid payload: list of items required"},
                        status=status.HTTP_400_BAD_REQUEST)

    # ---- Step 4: 落库（严格要求存在 name；用 link/url/source 取唯一键）----
    product_rows = []
    prod_created = 0

    with transaction.atomic():
        for p in items:
            if not isinstance(p, dict):
                continue

            name = (str(p.get("name") or "")).strip()[:100]
            if not name:
                continue  # ✅ 你要求：不要其他字段来填充，就直接跳过

            link = (str(p.get("link") or p.get("url") or p.get("source") or "")).strip()[:1000]
            if not link:
                continue  # 仍用 link 作为唯一键

            price = p.get("price")

            try:
                prod, created = Product.objects.update_or_create(
                    source=link,
                    defaults=dict(name=name, price=price, attribute=None),
                )
            except IntegrityError:
                continue

            if created:
                prod_created += 1

            product_rows.append({
                "id": prod.id,
                "name": prod.name,
                "source": prod.source,
                "price": prod.price,
            })

    dialogue.answer = str(answer)[:2000]
    dialogue.save(update_fields=["answer", "update_time"])

    # ---- Step 5: 返回给前端（你指定的最终格式）----
    return Response(
        {
            "data": {
                "product": product_rows,   # [{id, name, source, price}]
                "answer": answer
            },
            "response": {
                "ok": True,
                "stats": {
                    "products_created": prod_created,
                    "total_products": len(product_rows),
                },
                "history_size": len(history),
                "preference_used": bool(preference),
            }
        },
        status=status.HTTP_200_OK,
    )








def _resolve_customer(user_id: int) -> Customer:
    """
    兼容两种传参：
    1) user_id 直接是 Customer.id -> 直接取 pk
    2) user_id 是 User.id -> 用 Customer.user_id 去匹配
    """
    # 先当作 Customer 主键
    cust = Customer.objects.filter(id=user_id).first()
    if cust:
        return cust
    # 再当作 User 主键映射
    cust = Customer.objects.filter(user_id=user_id).first()
    if cust:
        return cust
    # 两种方式都没有则 404
    raise Customer.DoesNotExist


@api_view(["GET"])
@permission_classes([AllowAny])
def user_preference(request, user_id: int, product_id: int):
    """
    GET /customer/<user_id>/product/<product_id>/
    作用：把 (customer_id, product_id) 记录到 customer_preference 表
    返回：
    {
      "ok": true,
      "data": {"id": 12, "customer_id": 3, "product_id": 7, "status": "created|exists"}
    }
    """
    # 1) 解析并校验实体
    try:
        customer = _resolve_customer(user_id)
    except Customer.DoesNotExist:
        return Response({"detail": f"customer not found for id={user_id}"}, status=status.HTTP_404_NOT_FOUND)

    product = get_object_or_404(Product, pk=product_id)

    # 2) 幂等写入（存在则不重复插入）
    pref, created = CustomerPreference.objects.get_or_create(
        customer=customer,
        product=product,
        defaults={},  # 时间戳自动填
    )

    # 若已存在，顺手更新时间戳（便于你看最近一次选择）
    if not created:
        pref.update_time = timezone.now()
        pref.save(update_fields=["update_time"])

    return Response(
        {
            "ok": True,
            "data": {
                "id": pref.id,
                "customer_id": customer.id,
                "product_id": product.id,
                "status": "created" if created else "exists",
            },
        },
        status=status.HTTP_200_OK,
    )


# ==============================
# New: call Agent directly (preferred)
# ==============================
@api_view(["POST"])
@permission_classes([AllowAny])
def process_customer_data_agent(request, user_id: int):
    """Call AI Agent /agent and persist products and answer."""
    question = (request.data.get("question") or "").strip()
    if not question:
        return Response({"detail": "question is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Build history
    history_qas = list(
        UserDialogue.objects.filter(user_id=user_id)
        .order_by("create_time")
        .values("question", "answer")
    )
    history = [{"question": q["question"], "answer": q["answer"]} for q in history_qas]

    # Write dialogue (answer to be filled later)
    dialogue = UserDialogue.objects.create(user_id=user_id, question=question, answer="")

    # Ensure URL points to unified /agent entry
    agent_url = os.getenv("AI_AGENT_URL", "http://ai-agent:9000/agent")
    try:
        ai_response = requests.post(agent_url, json={"question": question, "history": history}, timeout=60)
        ai_response.raise_for_status()
        ai_data = ai_response.json()
    except Exception as e:
        return Response({"detail": f"AI-Agent request failed: {e}"}, status=status.HTTP_502_BAD_GATEWAY)

    products_payload = ai_data.get("product") or ai_data.get("products") or []
    answer = ai_data.get("answer", "")
    if not isinstance(products_payload, list):
        return Response({"detail": "Invalid product format: product must be a list"}, status=status.HTTP_400_BAD_REQUEST)

    def pick_one_attr(attrs):
        if not attrs:
            return None
        if isinstance(attrs, dict):
            k, v = next(iter(attrs.items()))
            return str(k), str(v)
        if isinstance(attrs, list) and attrs and isinstance(attrs[0], dict) and len(attrs[0]) == 1:
            k, v = next(iter(attrs[0].items()))
            return str(k), str(v)
        return None

    product_rows = []
    attr_created = 0
    prod_created = 0
    with transaction.atomic():
        for p in products_payload:
            if not isinstance(p, dict):
                continue
            chosen_attr_obj = None
            chosen = pick_one_attr(p.get("attributes"))
            if chosen:
                code, value = chosen
                chosen_attr_obj, was_created = Attribute.objects.get_or_create(code=code, value=value)
                if was_created:
                    attr_created += 1

            source = (p.get("source") or "")[:1000]
            if not source:
                continue
            try:
                prod, created = Product.objects.update_or_create(
                    source=source,
                    defaults=dict(
                        attribute=chosen_attr_obj,
                        description=(p.get("description") or "")[:100],
                        type=(p.get("type") or "")[:100],
                        name=(p.get("name") or "")[:100],
                        brand=(p.get("brand") or "")[:100],
                        price=p.get("price"),
                    ),
                )
            except IntegrityError:
                continue
            if created:
                prod_created += 1
            product_rows.append({"id": prod.id, "name": prod.name, "source": prod.source})

        dialogue.answer = str(answer)[:2000]
        dialogue.save(update_fields=["answer", "update_time"])

    return Response(
        {
            "data": {"product": product_rows, "answer": answer},
            "response": {
                "ok": True,
                "stats": {
                    "attributes_created": attr_created,
                    "products_created": prod_created,
                    "total_products": len(product_rows),
                },
                "history_size": len(history),
            },
        },
        status=status.HTTP_200_OK,
    )


# ==============================
# Merchant portrait: call Agent and persist hot products + user portraits
# ==============================
@api_view(["POST"])
@permission_classes([AllowAny])
def merchant_profile(request, user_id: int):
    """
    调 AI-Agent 生成受众画像，解析并仅落库：
      - product
      - category
      - gender（数组 -> 逗号拼接）
      - age_range
      - summary
    以 (merchant_id, product, quarter) 作为 upsert 唯一键。
    """
    question = (request.data.get("question") or "").strip()
    if not question:
        return Response({"detail": "question is required"}, status=status.HTTP_400_BAD_REQUEST)

    # 你也可以把其它上下文（history、preference等）拼进 payload
    payload = {"question": question}

    # --- 调用 AI-Agent ---
    try:
        ai_response = requests.post(AI_AGENT_URL, json=payload, timeout=60)
        ai_response.raise_for_status()
        ai_data = ai_response.json()
    except requests.RequestException as e:
        return Response({"detail": f"AI-Agent error: {e}"}, status=status.HTTP_502_BAD_GATEWAY)
    except ValueError:
        return Response({"detail": "AI-Agent returned invalid JSON"}, status=status.HTTP_502_BAD_GATEWAY)

    # --- 解析所需字段（按你提供的 schema）---
    facts = ai_data.get("facts", {}) if isinstance(ai_data, dict) else {}
    demo  = facts.get("demographics", {}) if isinstance(facts, dict) else {}

    product    = str(facts.get("product") or "").strip()[:255]
    category   = str(facts.get("category") or "").strip()[:100]
    gender_arr = demo.get("gender") if isinstance(demo, dict) else []
    gender     = ",".join([str(g).strip() for g in (gender_arr or [])])[:100]
    age_range  = str(demo.get("age_range") or "").strip()[:50]
    summary    = str(facts.get("summary") or "").strip()
    quarter    = str(ai_data.get("quarter") or "").strip()[:16]  # 可选
    request_id = str(ai_data.get("request_id") or "").strip()[:64]  # 可选

    # 基础校验（按需可放宽）
    if not product or not category or not gender or not age_range:
        return Response({"detail": "missing required fields in AI-Agent response"},
                        status=status.HTTP_502_BAD_GATEWAY)

    # --- 落库（upsert）---
    with transaction.atomic():
        obj, created = ProductUserPortrait.objects.update_or_create(
            # 唯一键（建议）：同一个商家+同一个商品+同一季度只保留一条
            product=product,
            defaults=dict(
                category=category,
                gender=gender,
                age_range=age_range,
                summary=summary,
            ),
        )

    # --- 回传前端（只这五个字段）---
    return Response(
        {
            "data": {
                "product": obj.product,
                "category": obj.category,
                "gender": obj.gender,
                "age_range": obj.age_range,
                "summary": obj.summary,
            },
            "response": {"ok": True, "created": created, "quarter": quarter}
        },
        status=status.HTTP_200_OK,
    )