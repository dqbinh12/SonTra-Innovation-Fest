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
      contactEmail: 'hello@innovationfest.vn',
      contactPhone: '+84 123 456 789',
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/' },
      ],
      footerText: 'Innovate Today, Shape Tomorrow.',
    },
    {
      siteName: 'Son Tra Innovation Fest',
      footerText: 'Innovate Today, Shape Tomorrow.',
    },
    { publish: false },
  );

  await seedSingle(
    strapi,
    'api::home-page.home-page',
    {
      heroTitle: 'Innovate Today, Shape Tomorrow',
      heroSubtitle:
        'Three days of technology, FinTech and sustainable living on the Son Tra waterfront.',
      eventDate: '2–4 October 2026',
      venue: '171–173 Tran Hung Dao, Da Nang',
      ctaLabel: 'Plan your visit',
      ctaHref: '/attend',
      stats: [
        { label: 'Days', value: '3' },
        { label: 'Daily', value: '9:00 – 22:00' },
        { label: 'Entry', value: 'Free' },
      ],
      aboutTeaser:
        'A flagship celebration of technology, innovation and global lifestyle in Son Tra Ward.',
      seo: {
        metaTitle: 'Son Tra Innovation Fest 2026',
        metaDescription:
          'Free technology and innovation festival in Da Nang, 2–4 October 2026. Innovate Today, Shape Tomorrow.',
      },
    },
    {
      heroTitle: 'Innovate Today, Shape Tomorrow',
      heroSubtitle:
        'Ba ngày công nghệ, công nghệ tài chính và lối sống bền vững bên bờ biển Sơn Trà.',
      eventDate: 'Ngày 2–4 tháng 10, 2026',
      venue: '171–173 Trần Hưng Đạo, Đà Nẵng',
      ctaLabel: 'Lên kế hoạch tham dự',
      ctaHref: '/tham-du',
      stats: [
        { label: 'Ngày', value: '3' },
        { label: 'Mỗi ngày', value: '9:00 – 22:00' },
        { label: 'Vào cửa', value: 'Miễn phí' },
      ],
      aboutTeaser:
        'Lễ hội thường niên tôn vinh công nghệ, đổi mới sáng tạo và lối sống toàn cầu tại phường Sơn Trà.',
    },
  );

  await seedSingle(
    strapi,
    'api::attend-page.attend-page',
    {
      heroTitle: 'Why attend?',
      heroBody:
        'An immersive festival where visitors engage with technology, culture and food rather than just watch.',
      audience: paragraphs(
        'Local communities, international visitors, investors and the global business ecosystem — alongside real estate developers, educational institutions, startups and innovation-driven enterprises.',
      ),
      benefits: [
        { title: 'Free entry', description: 'No ticket, no registration.' },
        { title: 'Three full days', description: '2–4 October, 9:00 to 22:00 daily.' },
        {
          title: 'Hands-on, not hands-off',
          description: 'Interact with the technology, cultural showcases and F&B on site.',
        },
      ],
      entryInfo: paragraphs(
        'Entry is free. No registration or ticket is required.',
        'The festival runs from 9:00 to 22:00 on 2, 3 and 4 October 2026.',
      ),
    },
    {
      heroTitle: 'Vì sao nên tham dự?',
      heroBody:
        'Một lễ hội trải nghiệm, nơi khách tham quan tương tác trực tiếp với công nghệ, văn hoá và ẩm thực thay vì chỉ quan sát.',
      audience: paragraphs(
        'Cộng đồng địa phương, khách quốc tế, nhà đầu tư và hệ sinh thái doanh nghiệp toàn cầu — cùng các nhà phát triển bất động sản, cơ sở giáo dục, startup và doanh nghiệp đổi mới sáng tạo.',
      ),
      benefits: [
        { title: 'Vào cửa miễn phí', description: 'Không cần vé, không cần đăng ký.' },
        { title: 'Trọn ba ngày', description: 'Ngày 2–4 tháng 10, 9:00 đến 22:00 mỗi ngày.' },
        {
          title: 'Trải nghiệm trực tiếp',
          description: 'Tương tác với công nghệ, không gian văn hoá và ẩm thực tại chỗ.',
        },
      ],
      entryInfo: paragraphs(
        'Vào cửa miễn phí. Không cần đăng ký hay vé.',
        'Lễ hội diễn ra từ 9:00 đến 22:00 các ngày 2, 3 và 4 tháng 10 năm 2026.',
      ),
    },
  );

  await seedSingle(
    strapi,
    'api::sponsors-page.sponsors-page',
    {
      title: 'Sponsors',
      intro: 'Son Tra Innovation Fest is made possible by our partners.',
      applicationIntro: 'Tell us about your company and we will get back to you.',
    },
    {
      title: 'Nhà tài trợ',
      intro: 'Son Tra Innovation Fest được tổ chức nhờ sự đồng hành của các đối tác.',
      applicationIntro:
        'Hãy cho chúng tôi biết về doanh nghiệp của bạn, chúng tôi sẽ liên hệ lại.',
    },
  );

  await seedSingle(
    strapi,
    'api::agenda-page.agenda-page',
    {
      title: 'Agenda',
      intro: 'Two days of talks, panels and demos. The full schedule is below.',
    },
    {
      title: 'Chương trình',
      intro: 'Hai ngày toạ đàm, thảo luận và trình diễn. Lịch trình đầy đủ bên dưới.',
    },
  );

  await seedSingle(
    strapi,
    'api::exhibition-page.exhibition-page',
    {
      title: 'Exhibition',
      intro: 'Technology, FinTech and sustainable living across the festival halls.',
      floorPlanCaption: 'Floor plan to be published closer to the event.',
    },
    {
      title: 'Khu trưng bày',
      intro: 'Công nghệ, công nghệ tài chính và lối sống bền vững tại các hội trường của lễ hội.',
      floorPlanCaption: 'Sơ đồ mặt bằng sẽ được công bố gần ngày diễn ra sự kiện.',
    },
  );

  await seedSingle(
    strapi,
    'api::location-page.location-page',
    {
      address: '171–173 Tran Hung Dao\nSon Tra, Da Nang\nVietnam',
      // Approximate — confirm the exact pin with the venue before go-live.
      mapLatitude: 16.0678,
      mapLongitude: 108.2298,
      directions: paragraphs(
        'The festival runs 9:00 to 22:00 on 2, 3 and 4 October 2026.',
        'Directions and transport information will be published closer to the event.',
      ),
      parkingNotes: paragraphs('Parking and transport details to be confirmed.'),
    },
    {
      address: '171–173 Trần Hưng Đạo\nSơn Trà, Đà Nẵng\nViệt Nam',
      directions: paragraphs(
        'Lễ hội diễn ra từ 9:00 đến 22:00 các ngày 2, 3 và 4 tháng 10 năm 2026.',
        'Thông tin hướng dẫn di chuyển sẽ được công bố gần ngày diễn ra sự kiện.',
      ),
      parkingNotes: paragraphs('Thông tin bãi đỗ xe và di chuyển sẽ được cập nhật.'),
    },
  );

  await seedSingle(
    strapi,
    'api::about-page.about-page',
    {
      story: paragraphs(
        'Son Tra Innovation Fest is a large-scale signature event reflecting the identity of Son Tra Ward, with the ambition of becoming an annual flagship celebration of technology, innovation and global lifestyle.',
        'The festival positions Son Tra as a dynamic destination for technology, financial technology and sustainable living — attracting local communities, international visitors, investors and the global business ecosystem, and connecting leading technology companies with real estate developers, educational institutions, startups and innovation-driven enterprises.',
        'Designed as an immersive and interactive experience, it lets visitors actively engage with cutting-edge technology, cultural showcases and premium food and beverage rather than simply observing them.',
        'Beyond the visitor experience, the festival contributes to local economic growth through tourism revenue, and serves as a platform to promote the Da Nang International Financial Center (DIFC) to domestic and international audiences.',
      ),
      mission: 'Innovate Today, Shape Tomorrow.',
      organizerName: 'DN365',
    },
    {
      story: paragraphs(
        'Son Tra Innovation Fest là sự kiện quy mô lớn mang bản sắc riêng của phường Sơn Trà, với tham vọng trở thành lễ hội thường niên tôn vinh công nghệ, đổi mới sáng tạo và lối sống toàn cầu.',
        'Lễ hội định vị Sơn Trà là điểm đến năng động về công nghệ, công nghệ tài chính và lối sống bền vững — thu hút cộng đồng địa phương, khách quốc tế, nhà đầu tư và hệ sinh thái doanh nghiệp toàn cầu, đồng thời kết nối các tập đoàn công nghệ hàng đầu với nhà phát triển bất động sản, cơ sở giáo dục, startup và doanh nghiệp đổi mới sáng tạo.',
        'Được thiết kế như một trải nghiệm nhập vai và tương tác, lễ hội để khách tham quan trực tiếp trải nghiệm công nghệ tiên tiến, không gian văn hoá và ẩm thực cao cấp thay vì chỉ quan sát.',
        'Bên cạnh trải nghiệm cho khách tham quan, lễ hội góp phần thúc đẩy tăng trưởng kinh tế địa phương thông qua doanh thu du lịch, đồng thời là nền tảng quảng bá Trung tâm Tài chính Quốc tế Đà Nẵng (DIFC) tới công chúng trong nước và quốc tế.',
      ),
      mission: 'Innovate Today, Shape Tomorrow.',
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
        title: 'FinTech and the Da Nang International Financial Center',
        day: '2026-10-03',
        startTime: '14:00:00.000',
        endTime: '15:00:00.000',
        speaker: 'TBC',
        track: 'FinTech',
        location: 'Hall A',
      },
      vi: {
        title: 'FinTech và Trung tâm Tài chính Quốc tế Đà Nẵng',
        track: 'Công nghệ tài chính',
        location: 'Hội trường A',
      },
    },
    {
      en: {
        title: 'Sustainable living showcase',
        day: '2026-10-04',
        startTime: '10:00:00.000',
        endTime: '11:30:00.000',
        speaker: 'TBC',
        track: 'Sustainability',
        location: 'Hall B',
      },
      vi: {
        title: 'Không gian lối sống bền vững',
        track: 'Phát triển bền vững',
        location: 'Hội trường B',
      },
    },
    {
      en: {
        title: 'Closing panel',
        day: '2026-10-04',
        startTime: '20:00:00.000',
        endTime: '21:30:00.000',
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
        title: 'Save the date: 2–4 October',
        slug: 'save-the-date',
        date: '2026-09-01',
        excerpt: 'The first Son Tra Innovation Fest takes place on 2, 3 and 4 October.',
        body: paragraphs(
          'Son Tra Innovation Fest runs on the Son Tra waterfront from 2 to 4 October 2026, 9:00 to 22:00 daily.',
          'This is placeholder content seeded for development.',
        ),
        category: 'Announcement',
      },
      vi: {
        title: 'Lưu lịch: ngày 2–4 tháng 10',
        slug: 'luu-lich',
        excerpt: 'Son Tra Innovation Fest đầu tiên diễn ra vào ngày 2, 3 và 4 tháng 10.',
        body: paragraphs(
          'Son Tra Innovation Fest diễn ra bên bờ biển Sơn Trà từ ngày 2 đến 4 tháng 10 năm 2026, 9:00 đến 22:00 mỗi ngày.',
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
        excerpt: 'First sessions confirmed across all three days.',
        body: paragraphs('The full schedule will be published on the Agenda page.'),
        category: 'Programme',
      },
      vi: {
        title: 'Chương trình đang dần hoàn thiện',
        slug: 'chuong-trinh-dan-hoan-thien',
        excerpt: 'Những phiên đầu tiên đã được xác nhận cho cả ba ngày.',
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
