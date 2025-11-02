from django.db import models

# logout token
class BlacklistedToken(models.Model):
    token = models.TextField(unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "blacklists"

    def __str__(self):
        return self.token[:50]
    
# ========== 1. User ==========
class User(models.Model):
    email = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=64)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"


# ========== 2. Administor（关联 User） ==========
class Administor(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column="user_id")
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "administors"


# ========== 3. Customer（关联 User） ==========
class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column="user_id")
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customers"

# ========== Merchant（关联 User） ==========
class Merchant(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column="user_id")
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "merchants"


# ========== 4. Attribute ==========
class Attribute(models.Model):
    code = models.CharField(max_length=100)   # 图中无 UNIQUE（去掉）
    value = models.CharField(max_length=100)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "attributes"
        constraints = [
            models.UniqueConstraint(fields=["code", "value"], name="uk_code_value")
        ]


# ========== 5. Product（关联 Attribute） ==========
class Product(models.Model):
    attribute = models.ForeignKey(
        Attribute, on_delete=models.SET_NULL, null=True, db_column="attribute_id"
    )
    description = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100, unique=True)
    brand = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    source = models.CharField(max_length=1000)
    value_datetime = models.DateTimeField(auto_now_add=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"


# ========== 6. Product_User_portrait（关联 Product） ==========
class ProductUserPortrait(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    age_range = models.CharField(max_length=50)
    gender = models.CharField(max_length=50)
    summary = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "product_user_portraits"


# ========== 7. Merchant_hot_product ==========
class MerchantHotProduct(models.Model):
    name = models.CharField(max_length=50, null=True, blank=True)
    rank = models.IntegerField()
    category = models.CharField(max_length=200, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sales = models.IntegerField()
    quarter = models.CharField(max_length=64, null=True, blank=True)
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "merchant_hot_products"


# ========== 8. User_Dialogue（关联 User） ==========
class UserDialogue(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column="user_id")
    question = models.TextField()
    answer = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_dialogues"


# ========== 9. Customer_Preference（关联 Customer） ==========
class CustomerPreference(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")

    # 如果数据库里 customer_id 允许 NULL，就保留 null=True + SET_NULL；
    # 如果是 NOT NULL，请把 null=True 去掉，并把 on_delete 改为 DO_NOTHING 或 CASCADE（按你实际外键约束）。
    customer = models.ForeignKey(
        "Customer",
        on_delete=models.SET_NULL,
        null=True,
        db_column="customer_id",
        related_name="preferences",
    )

    preference = models.TextField(db_column="preference")

    # 这两列直接映射已有列；数据库里已经在存时间的话，用下面写法最稳
    create_time = models.DateTimeField(db_column="create_time")
    update_time = models.DateTimeField(db_column="update_time")

    class Meta:
        db_table = "customer_preferences"
        managed = False  # 非常重要：不让 Django 迁移改你现有表
        indexes = [
            models.Index(fields=["customer"], name="idx_cp_customer_id"),
        ]

    def __str__(self):
        # 方便后台查看
        cid = self.customer_id if hasattr(self, "customer_id") else None
        return f"CustomerPreference(id={self.id}, customer_id={cid})"
