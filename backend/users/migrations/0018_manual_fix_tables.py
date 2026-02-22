from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_feedback'),
    ]

    operations = [
        migrations.CreateModel(
            name='Certification',
            fields=[
                ('cert_id', models.AutoField(primary_key=True, serialize=False)),
                ('cert_name', models.CharField(max_length=100)),
                ('issuing_organization', models.CharField(max_length=100)),
                ('issue_date', models.DateField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, db_column='user_id')),
            ],
            options={
                'db_table': 'certification',
            },
        ),
        migrations.CreateModel(
            name='Adminlogs',
            fields=[
                ('log_id', models.AutoField(primary_key=True, serialize=False)),
                ('action_type', models.CharField(max_length=50)),
                ('timestamp', models.DateTimeField(null=True)),
                ('admin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_logs', to=settings.AUTH_USER_MODEL, db_column='admin_id')),
                ('target_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='target_user_logs', to=settings.AUTH_USER_MODEL, db_column='target_user_id')),
            ],
            options={
                'db_table': 'adminlogs',
            },
        ),
    ]
