from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0017_feedback'),
    ]

    operations = [
        migrations.RunSQL(
            """
            -- Create Certification Table
            CREATE TABLE certification (
                cert_id SERIAL PRIMARY KEY,
                cert_name varchar(100) NOT NULL,
                issuing_organization varchar(100) NOT NULL,
                issue_date date NOT NULL,
                user_id integer NOT NULL REFERENCES "user" ("user_id") DEFERRABLE INITIALLY DEFERRED
            );
            CREATE INDEX users_certification_user_id ON certification (user_id);

            -- Create Adminlogs Table
            CREATE TABLE adminlogs (
                log_id SERIAL PRIMARY KEY,
                action_type varchar(50) NOT NULL,
                timestamp timestamp with time zone NULL,
                admin_id integer NOT NULL REFERENCES "user" ("user_id") DEFERRABLE INITIALLY DEFERRED,
                target_user_id integer NOT NULL REFERENCES "user" ("user_id") DEFERRABLE INITIALLY DEFERRED
            );
            CREATE INDEX users_adminlogs_admin_id ON adminlogs (admin_id);
            CREATE INDEX users_adminlogs_target_user_id ON adminlogs (target_user_id);
            """
        ),
    ]
