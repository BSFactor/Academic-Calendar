from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
        ('calendar_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofile',
            name='major',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to='calendar_app.major'),
        ),
        migrations.AddField(
            model_name='tutorprofile',
            name='courses',
            field=models.ManyToManyField(blank=True, related_name='tutors', to='calendar_app.course'),
        ),
    ]
