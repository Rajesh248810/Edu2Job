from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_feedback'),
    ]

    operations = [
        migrations.RunSQL(
            """
            -- Create Certification Table
            CREATE TABLE IF NOT EXISTS certification (
                cert_id INT AUTO_INCREMENT PRIMARY KEY,
                cert_name varchar(100) NOT NULL,
                issuing_organization varchar(100) NOT NULL,
                issue_date date NOT NULL,
                user_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
            );
            -- Index might already exist if table existed, but skipping 'IF NOT EXISTS' for index in pure SQL is hard in MySQL 5.7, 
            -- but commonly ignored or handled. For safety we can skip explicit index creation if FK creates one or just let it fail/pass.
            -- Actually MySQL implicitly creates index for FK. 
            -- But we named it explicitly in previous code. Let's keep it simple.

            -- Create Adminlogs Table
            CREATE TABLE IF NOT EXISTS adminlogs (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                action_type varchar(50) NOT NULL,
                timestamp datetime NULL,
                admin_id INT NOT NULL,
                target_user_id INT NOT NULL,
                FOREIGN KEY (admin_id) REFERENCES user(user_id) ON DELETE CASCADE,
                FOREIGN KEY (target_user_id) REFERENCES user(user_id) ON DELETE CASCADE
            );
            """
        ),
    ]
