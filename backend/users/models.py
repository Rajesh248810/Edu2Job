from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=100)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banners/', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'user'
        verbose_name = 'App User'
        verbose_name_plural = 'App Users'
        
    def __str__(self):
        return self.name


class Education(models.Model):
    education_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE) 
    degree = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    university = models.CharField(max_length=100)
    cgpa = models.DecimalField(db_column='CGPA', max_digits=3, decimal_places=2) 
    year_of_completion = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'education'


class Certification(models.Model):
    cert_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE)
    cert_name = models.CharField(max_length=100)
    issuing_organization = models.CharField(max_length=100)
    issue_date = models.DateField()

    class Meta:
        managed = False
        db_table = 'certification'


class Predictionhistory(models.Model):
    prediction_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.CASCADE)
    predicted_roles = models.CharField(max_length=255)
    confidence_scores = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'predictionhistory'


class Adminlogs(models.Model):
    log_id = models.AutoField(primary_key=True)
    admin = models.ForeignKey(User, models.CASCADE, related_name='admin_logs')
    target_user = models.ForeignKey(User, models.CASCADE, related_name='target_user_logs')
    action_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'adminlogs'

# --- NEW MODELS FOR TRAINING ---

class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)

    class Meta:
        managed = True # Let Django create this table
        db_table = 'skills'

class TrainingData(models.Model):
    training_id = models.AutoField(primary_key=True)
    degree = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    skills = models.TextField(help_text="Comma-separated skills")
    certifications = models.TextField(help_text="Comma-separated certifications")
    target_job_role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True # Let Django create this table
        db_table = 'training_data'

class JobPlacement(models.Model):
    placement_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='placements')
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    placement_type = models.CharField(max_length=20, choices=[('Job', 'Job'), ('Internship', 'Internship')])
    date_of_joining = models.DateField()

    class Meta:
        managed = True
        db_table = 'job_placements'

class NewsletterSubscriber(models.Model):
    subscriber_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'newsletter_subscribers'
