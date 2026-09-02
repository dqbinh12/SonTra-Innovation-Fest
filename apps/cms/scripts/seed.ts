/**
 * Seeds placeholder content in EN and VI so the frontend has something to
 * render during Phase 2 — the workbook's Phase 2 deliverable is an MVP with
 * sample content, before the client enters the real thing in Phase 3.
 *
 *   pnpm --filter @sif/cms seed
 *
 * Idempotent: it skips any content type that already has an entry, so running
 * it twice is safe and it will never overwrite real content.
 */
import { compileStrapi, createStrapi, type Core } from '@strapi/strapi';

/** Strapi `blocks` value for a run of plain paragraphs. */
const paragraphs = (...texts: string[]) =>
  texts.map((text) => ({
    type: 'paragraph',
    children: [{ type: 'text', text }],
  }));

type Uid = Parameters<Core.Strapi['documents']>[0];

async function seedSingle(
  strapi: Core.Strapi,
  uid: Uid,
  en: Record<string, unknown>,
  vi: Record<string, unknown>,
  { publish = true } = {},
) {
  const existing = await strapi.documents(uid).findFirst({ locale: 'en' });
  if (existing) {
    strapi.log.info(`[seed] ${uid} already has content, skipping`);
    return;
  }

  const created = await strapi.documents(uid).create({
    data: en,
    locale: 'en',
    ...(publish ? { status: 'published' as const } : {}),
  });

  await strapi.documents(uid).update({
    documentId: created.documentId,
    data: vi,
    locale: 'vi',
    ...(publish ? { status: 'published' as const } : {}),
  });

  strapi.log.info(`[seed] created ${uid}`);
}

async function seedCollection(
  strapi: Core.Strapi,
  uid: Uid,
  entries: { en: Record<string, unknown>; vi: Record<string, unknown> }[],
) {
  const count = await strapi.documents(uid).count({ locale: 'en' });
  if (count > 0) {
    strapi.log.info(`[seed] ${uid} already has ${count} entries, skipping`);
    return;
  }

  for (const entry of entries) {
    const created = await strapi.documents(uid).create({
      data: entry.en,
      locale: 'en',
      status: 'published',
    });
    await strapi.documents(uid).update({
      documentId: created.documentId,
      data: entry.vi,
      locale: 'vi',
      status: 'published',
    });
  }

  strapi.log.info(`[seed] created ${entries.length} × ${uid}`);
}

async function seed(strapi: Core.Strapi) {
  await seedSingle(
    strapi,
    'api::site-setting.site-setting',
    {
      siteName: 'Son Tra Innovation Fest',
      contactEmail: 'hello@sontrainnovationfest.vn',
      contactPhone: '+84 236 000 0000',
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/' },
      ],
      footerText: "Da Nang's innovation and technology showcase.",
    },
    {
      siteName: 'Son Tra Innovation Fest',
      footerText: 'Sự kiện đổi mới sáng tạo và công nghệ của Đà Nẵng.',
    },
    { publish: false },
  );

  await seedSingle(
    strapi,
    'api::home-page.home-page',
    {
      heroTitle: 'Son Tra Innovation Fest 2026',
      heroSubtitle: 'Two days of technology, ideas and the people building them in Da Nang.',
      eventDate: '2–3 October 2026',
      venue: 'Son Tra, Da Nang',
      ctaLabel: 'Plan your visit',
      ctaHref: '/attend',
      stats: [
        { label: 'Days', value: '2' },
        { label: 'Exhibitors', value: '60+' },
        { label: 'Speakers', value: '40+' },
        { label: 'Entry', value: 'Free' },
      ],
      aboutTeaser: 'The first edition of Da Nang’s innovation festival.',
      seo: {
        metaTitle: 'Son Tra Innovation Fest 2026',
        metaDescription: 'Free innovation and technology festival in Da Nang, 2–3 October 2026.',
      },
    },
    {
      heroTitle: 'Son Tra Innovation Fest 2026',
      heroSubtitle:
        'Hai ngày công nghệ, ý tưởng và những con người đang kiến tạo tại Đà Nẵng.',
      eventDate: 'Ngày 2–3 tháng 10, 2026',
      venue: 'Sơn Trà, Đà Nẵng',
      ctaLabel: 'Lên kế hoạch tham dự',
      ctaHref: '/tham-du',
      stats: [
        { label: 'Ngày', value: '2' },
        { label: 'Đơn vị triển lãm', value: '60+' },
        { label: 'Diễn giả', value: '40+' },
        { label: 'Vào cửa', value: 'Miễn phí' },
      ],
      aboutTeaser: 'Kỳ đầu tiên của lễ hội đổi mới sáng tạo Đà Nẵng.',
    },
  );

  await seedSingle(
    strapi,
    'api::attend-page.attend-page',
    {
      heroTitle: 'Why attend?',
      heroBody: 'Meet the people building Da Nang’s technology scene.',
      audience: paragraphs(
        'Founders, engineers, students, investors and anyone curious about what is being built in central Vietnam.',
      ),
      benefits: [
        { title: 'Free entry', description: 'No ticket, no registration.' },
        { title: 'Two full days', description: 'Talks, demos and the exhibition hall.' },
        { title: 'Meet exhibitors', description: 'Over 60 companies and research teams.' },
      ],
      entryInfo: paragraphs('Entry is free. No registration or ticket is required.'),
    },
    {
      heroTitle: 'Vì sao nên tham dự?',
      heroBody: 'Gặp gỡ những người đang xây dựng hệ sinh thái công nghệ Đà Nẵng.',
      audience: paragraphs(
        'Nhà sáng lập, kỹ sư, sinh viên, nhà đầu tư và bất kỳ ai quan tâm đến những gì đang được kiến tạo tại miền Trung.',
      ),
      benefits: [
        { title: 'Vào cửa miễn phí', description: 'Không cần vé, không cần đăng ký.' },
        { title: 'Trọn hai ngày', description: 'Toạ đàm, demo và khu trưng bày.' },
        { title: 'Gặp đơn vị triển lãm', description: 'Hơn 60 doanh nghiệp và nhóm nghiên cứu.' },
      ],
      entryInfo: paragraphs('Vào cửa miễn phí. Không cần đăng ký hay vé.'),
    },
  );

  await seedSingle(
    strapi,
    'api::sponsors-page.sponsors-page',
    {
      title: 'Sponsors',
      intro: 'Son Tra Innovation Fest is made possible by our partners.',
      tiers: [
        { name: 'Platinum', order: 1, benefits: paragraphs('Main stage naming, premium booth.') },
        { name: 'Gold', order: 2, benefits: paragraphs('Large booth, logo on all materials.') },
        { name: 'Silver', order: 3, benefits: paragraphs('Standard booth, logo on the website.') },
      ],
      applicationIntro: 'Tell us about your company and we will get back to you.',
    },
    {
      title: 'Nhà tài trợ',
      intro: 'Son Tra Innovation Fest được tổ chức nhờ sự đồng hành của các đối tác.',
      tiers: [
        {
          name: 'Bạch kim',
          order: 1,
          benefits: paragraphs('Đặt tên sân khấu chính, gian hàng cao cấp.'),
        },
        { name: 'Vàng', order: 2, benefits: paragraphs('Gian hàng lớn, logo trên mọi ấn phẩm.') },
        { name: 'Bạc', order: 3, benefits: paragraphs('Gian hàng tiêu chuẩn, logo trên website.') },
      ],
      applicationIntro:
        'Hãy cho chúng tôi biết về doanh nghiệp của bạn, chúng tôi sẽ liên hệ lại.',
    },
  );

  await seedSingle(
    strapi,
    'api::location-page.location-page',
    {
      address: 'Son Tra, Da Nang, Vietnam',
      mapLatitude: 16.1006,
      mapLongitude: 108.2617,
      directions: paragraphs('Placeholder — the exact venue is still open in the Decision Log.'),
      parkingNotes: paragraphs('Parking and transport details to be confirmed.'),
    },
    {
      address: 'Sơn Trà, Đà Nẵng, Việt Nam',
      directions: paragraphs('Nội dung tạm — địa điểm chính xác đang chờ xác nhận.'),
      parkingNotes: paragraphs('Thông tin bãi đỗ xe và di chuyển sẽ được cập nhật.'),
    },
  );

  await seedSingle(
    strapi,
    'api::about-page.about-page',
    {
      story: paragraphs(
        'Son Tra Innovation Fest is Da Nang’s first innovation and technology festival.',
        'This is placeholder copy — the organizer will replace it in Phase 3.',
      ),
      mission: 'Bring Da Nang’s innovation community together in one place, once a year.',
      organizerName: 'DN365',
    },
    {
      story: paragraphs(
        'Son Tra Innovation Fest là lễ hội đổi mới sáng tạo và công nghệ đầu tiên của Đà Nẵng.',
        'Đây là nội dung tạm — đơn vị tổ chức sẽ thay thế trong Giai đoạn 3.',
      ),
      mission: 'Kết nối cộng đồng đổi mới sáng tạo Đà Nẵng tại một nơi, mỗi năm một lần.',
      organizerName: 'DN365',
    },
  );

  await seedCollection(strapi, 'api::session.session', [
    {
      en: {
        title: 'Opening keynote',
        day: '2026-10-02',
        startTime: '09:00:00.000',
        endTime: '09:45:00.000',
        speaker: 'TBC',
        track: 'Main stage',
        location: 'Hall A',
      },
      vi: { title: 'Phát biểu khai mạc', track: 'Sân khấu chính', location: 'Hội trường A' },
    },
    {
      en: {
        title: 'Building for the Vietnamese market',
        day: '2026-10-02',
        startTime: '10:00:00.000',
        endTime: '10:45:00.000',
        speaker: 'TBC',
        track: 'Product',
        location: 'Hall B',
      },
      vi: { title: 'Xây dựng sản phẩm cho thị trường Việt Nam', track: 'Sản phẩm', location: 'Hội trường B' },
    },
    {
      en: {
        title: 'Closing panel',
        day: '2026-10-03',
        startTime: '16:00:00.000',
        endTime: '17:00:00.000',
        speaker: 'TBC',
        track: 'Main stage',
        location: 'Hall A',
      },
      vi: { title: 'Toạ đàm bế mạc', track: 'Sân khấu chính', location: 'Hội trường A' },
    },
  ]);

  await seedCollection(strapi, 'api::exhibitor.exhibitor', [
    {
      en: {
        companyName: 'Placeholder Robotics',
        boothNumber: 'A-01',
        category: 'Hardware',
        description: 'Sample exhibitor entry.',
      },
      vi: { category: 'Phần cứng', description: 'Mục triển lãm mẫu.' },
    },
    {
      en: {
        companyName: 'Placeholder AI Lab',
        boothNumber: 'B-14',
        category: 'Software',
        description: 'Sample exhibitor entry.',
      },
      vi: { category: 'Phần mềm', description: 'Mục triển lãm mẫu.' },
    },
  ]);

  await seedCollection(strapi, 'api::sponsor.sponsor', [
    // `name` is localized and required, so the VI entry has to repeat it even
    // though the value is the same.
    {
      en: { name: 'Placeholder Platinum Co.', tier: 'platinum', order: 1 },
      vi: { name: 'Placeholder Platinum Co.' },
    },
    {
      en: { name: 'Placeholder Gold Co.', tier: 'gold', order: 2 },
      vi: { name: 'Placeholder Gold Co.' },
    },
    {
      en: { name: 'Placeholder Silver Co.', tier: 'silver', order: 3 },
      vi: { name: 'Placeholder Silver Co.' },
    },
  ]);

  await seedCollection(strapi, 'api::article.article', [
    {
      en: {
        title: 'Save the date: 2–3 October',
        slug: 'save-the-date',
        date: '2026-09-01',
        excerpt: 'The first Son Tra Innovation Fest takes place on 2 and 3 October.',
        body: paragraphs(
          'Son Tra Innovation Fest returns to Da Nang on 2 and 3 October 2026.',
          'This is placeholder content seeded for development.',
        ),
        category: 'Announcement',
      },
      vi: {
        title: 'Lưu lịch: ngày 2–3 tháng 10',
        slug: 'luu-lich',
        excerpt: 'Son Tra Innovation Fest đầu tiên diễn ra vào ngày 2 và 3 tháng 10.',
        body: paragraphs(
          'Son Tra Innovation Fest diễn ra tại Đà Nẵng vào ngày 2 và 3 tháng 10 năm 2026.',
          'Đây là nội dung tạm phục vụ quá trình phát triển.',
        ),
        category: 'Thông báo',
      },
    },
    {
      en: {
        title: 'Exhibitor applications are open',
        slug: 'exhibitor-applications-open',
        date: '2026-09-02',
        excerpt: 'Companies can now apply for a booth in the exhibition hall.',
        body: paragraphs('Applications are handled through the Sponsors page form.'),
        category: 'Exhibition',
      },
      vi: {
        title: 'Mở đăng ký đơn vị triển lãm',
        slug: 'mo-dang-ky-trien-lam',
        excerpt: 'Các doanh nghiệp có thể đăng ký gian hàng tại khu trưng bày.',
        body: paragraphs('Đăng ký được tiếp nhận qua biểu mẫu trên trang Nhà tài trợ.'),
        category: 'Triển lãm',
      },
    },
    {
      en: {
        title: 'The agenda is taking shape',
        slug: 'agenda-taking-shape',
        date: '2026-09-03',
        excerpt: 'First sessions confirmed across both days.',
        body: paragraphs('The full schedule will be published on the Agenda page.'),
        category: 'Programme',
      },
      vi: {
        title: 'Chương trình đang dần hoàn thiện',
        slug: 'chuong-trinh-dan-hoan-thien',
        excerpt: 'Những phiên đầu tiên đã được xác nhận cho cả hai ngày.',
        body: paragraphs('Lịch trình đầy đủ sẽ được đăng tại trang Chương trình.'),
        category: 'Chương trình',
      },
    },
  ]);
}

async function main() {
  const app = await createStrapi(await compileStrapi()).load();

  try {
    await seed(app);
    app.log.info('[seed] done');
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
