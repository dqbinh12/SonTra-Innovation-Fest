import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';

export default function NotFound() {
  const t = useTranslations('error');

  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t('notFoundTitle')}</h1>
      <p className="text-muted-foreground mt-4">{t('notFoundBody')}</p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
      >
        {t('backHome')}
      </Link>
    </Container>
  );
}
