from django.core.management.base import BaseCommand, CommandError

from users.models import CustomUser


class Command(BaseCommand):
    help = (
        'Give an existing user the app\'s admin role (and Django admin access). '
        'Use after `createsuperuser`, which creates users with the customer role.'
    )

    def add_arguments(self, parser):
        parser.add_argument('username')

    def handle(self, *args, **options):
        try:
            user = CustomUser.objects.get(username=options['username'])
        except CustomUser.DoesNotExist:
            raise CommandError(f'User "{options["username"]}" does not exist.')
        user.role = 'admin'
        user.is_staff = True
        user.save(update_fields=['role', 'is_staff'])
        self.stdout.write(self.style.SUCCESS(f'"{user.username}" is now an admin.'))
