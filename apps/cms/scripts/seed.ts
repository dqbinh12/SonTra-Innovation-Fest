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
    const hasContent = Boolean(
      existing.heroTitle ||
      existing.title ||
      existing.siteName ||
      existing.address ||
      existing.story,
    );
    if (hasContent) {
      strapi.log.info(`[seed] ${uid} already has content, skipping`);
      return;
    }
    strapi.log.info(`[seed] ${uid} exists without content, replacing`);
    await strapi.documents(uid).delete({ documentId: existing.documentId });
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
      // Non-localized, so it only needs setting on the EN side. 09:00 ICT on
      // the opening day of the seeded agenda.
      countdown: { enabled: true, targetDate: '2026-10-02T02:00:00.000Z' },
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
      eventDays: [
        { date: '3 October 2026', startTime: '08:00:00', endTime: '22:00:00' },
        { date: '4 October 2026', startTime: '08:00:00', endTime: '17:00:00' },
      ],
      admission: 'Free',
      aboutTeaser:
        'A flagship celebration of technology, innovation and global lifestyle in Son Tra Ward.',
      introBadge: 'Official Teaser',
      introTitle: 'Experience Son Tra Innovation Fest',
      introBody:
        'Where nature, community and cutting-edge technology converge on the vibrant waterfront of Son Tra. Discover the ideas, makers and innovations shaping tomorrow.',
      introYoutubeUrl: 'https://www.youtube.com/watch?v=EB2RaO8jnck',
      exploreTitle: 'Explore the festival',
      exploreSubtitle: 'Three days, one waterfront. Here is where to start.',
      exploreAgenda: 'Talks, panels and workshops across all three days.',
      exploreExhibition: 'Meet the startups, labs and makers on the show floor.',
      exploreLocation: 'Getting there, parking and opening hours.',
      exploreSponsors: 'The partners making the festival possible.',
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
      eventDays: [
        { date: 'Ngày 3 tháng 10, 2026', startTime: '08:00:00', endTime: '22:00:00' },
        { date: 'Ngày 4 tháng 10, 2026', startTime: '08:00:00', endTime: '17:00:00' },
      ],
      admission: 'Miễn phí',
      aboutTeaser:
        'Lễ hội thường niên tôn vinh công nghệ, đổi mới sáng tạo và lối sống toàn cầu tại phường Sơn Trà.',
      introBadge: 'Teaser chính thức',
      introTitle: 'Trải nghiệm Lễ hội Đổi mới Sáng tạo Sơn Trà',
      introBody:
        'Nơi thiên nhiên, cộng đồng và công nghệ tiên phong giao thoa bên bờ sông Sơn Trà đầy sức sống. Cùng khám phá những ý tưởng, con người và sáng kiến đang kiến tạo tương lai.',
      introYoutubeUrl: 'https://www.youtube.com/watch?v=EB2RaO8jnck',
      exploreTitle: 'Khám phá sự kiện',
      exploreSubtitle: 'Ba ngày, một bờ sông. Bắt đầu từ đây.',
      exploreAgenda: 'Các buổi trò chuyện, tọa đàm và workshop trong cả ba ngày.',
      exploreExhibition: 'Gặp gỡ startup, phòng lab và nhà sáng tạo tại khu trưng bày.',
      exploreLocation: 'Đường đi, chỗ đỗ xe và giờ mở cửa.',
      exploreSponsors: 'Những đối tác đồng hành cùng sự kiện.',
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
    'api::news-page.news-page',
    {
      title: 'News',
      intro: 'Ideas, people and updates shaping Son Tra Innovation Fest.',
      pulseLabel: 'SIF 2026 Tech Dispatch',
      eventDate: 'Da Nang • Oct 2–4, 2026',
    },
    {
      title: 'Tin tức',
      intro: 'Ý tưởng, con người và những cập nhật mới từ Son Tra Innovation Fest.',
      pulseLabel: 'Nhịp đập công nghệ SIF 2026',
      eventDate: 'Đà Nẵng • 02–04/10/2026',
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
      applicationIntro: 'Hãy cho chúng tôi biết về doanh nghiệp của bạn, chúng tôi sẽ liên hệ lại.',
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
      mapEmbedHtml:
        '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d711.3421468911326!2d108.2238571197455!3d16.097853318784374!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142180fe0af6541%3A0x7286a33cefda8ba!2sWyndham%20Danang%20Golden%20Bay%20Hotel!5e0!3m2!1svi!2s!4v1790305495401!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
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
      // Not localised: the same organisations, under their official names.
      organizations: [
        { role: 'organizer', name: 'Phường Sơn Trà — Cộng đồng hạnh phúc' },
        {
          role: 'co-organizer',
          name: 'Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo Đà Nẵng (DISSC)',
        },
        { role: 'co-organizer', name: 'Đà Nẵng 365' },
        { role: 'coordinator', name: 'Hội Doanh nghiệp phường Sơn Trà' },
        { role: 'coordinator', name: 'JCI Vietnam' },
      ],
    },
    {
      story: paragraphs(
        'Son Tra Innovation Fest là sự kiện quy mô lớn mang bản sắc riêng của phường Sơn Trà, với tham vọng trở thành lễ hội thường niên tôn vinh công nghệ, đổi mới sáng tạo và lối sống toàn cầu.',
        'Lễ hội định vị Sơn Trà là điểm đến năng động về công nghệ, công nghệ tài chính và lối sống bền vững — thu hút cộng đồng địa phương, khách quốc tế, nhà đầu tư và hệ sinh thái doanh nghiệp toàn cầu, đồng thời kết nối các tập đoàn công nghệ hàng đầu với nhà phát triển bất động sản, cơ sở giáo dục, startup và doanh nghiệp đổi mới sáng tạo.',
        'Được thiết kế như một trải nghiệm nhập vai và tương tác, lễ hội để khách tham quan trực tiếp trải nghiệm công nghệ tiên tiến, không gian văn hoá và ẩm thực cao cấp thay vì chỉ quan sát.',
        'Bên cạnh trải nghiệm cho khách tham quan, lễ hội góp phần thúc đẩy tăng trưởng kinh tế địa phương thông qua doanh thu du lịch, đồng thời là nền tảng quảng bá Trung tâm Tài chính Quốc tế Đà Nẵng (DIFC) tới công chúng trong nước và quốc tế.',
      ),
      mission: 'Innovate Today, Shape Tomorrow.',
    },
  );

  await seedSingle(
    strapi,
    'api::media-page.media-page',
    {
      heroTitle: 'Media Center',
      heroSubtitle:
        'Official resources, press releases, media accreditation, and high-resolution assets for journalists covering Son Tra Innovation Fest 2026.',
      pressContactName: 'Media Relations Office — Ms. Hoang Lan',
      pressContactEmail: 'media@innovationfest.vn',
      pressContactPhone: '+84 236 3888 999',
      pressConference: {
        title: 'Official Press Conference: Son Tra Innovation Fest 2026',
        summary:
          'Join the organizing board and technology leaders for the official briefing on festival highlights, keynote speakers, and bilateral tech partnerships.',
        startsAt: '2026-09-25T02:00:00.000Z',
        endsAt: '2026-09-25T04:30:00.000Z',
        venue: 'Grand Ballroom, Wyndham Danang Golden Bay',
        address: '171–173 Tran Hung Dao, Son Tra, Da Nang',
        registrationUrl: 'https://forms.gle/sif2026-media-accreditation',
        registrationLabel: 'Request Press Accreditation',
        accreditation: paragraphs(
          'Accreditation is open to professional journalists, photographers, broadcast teams, and recognized technology content creators.',
          'Please submit your accreditation request at least 48 hours prior to the briefing. Press badges will be issued at the media desk upon presentation of a valid press card or assignment letter from your editorial office.',
        ),
        schedule: [
          {
            time: '08:30 – 09:00',
            title: 'Welcome & Media Check-in',
            description: 'Badge pickup, welcome coffee and distribution of the press kit.',
          },
          {
            time: '09:00 – 09:30',
            title: 'Opening Remarks & Festival Overview',
            description:
              'Presentation of SIF 2026 theme, key exhibitions, and international delegations.',
          },
          {
            time: '09:30 – 10:15',
            title: 'Keynote Announcement: Da Nang FinTech & Green Tech Corridor',
            description:
              'Strategic initiatives in collaboration with Da Nang International Financial Center (DIFC).',
          },
          {
            time: '10:15 – 11:00',
            title: 'Open Q&A with the Organizing Board & Partners',
            description:
              'Direct Q&A session with leadership from Son Tra district, DISSC, and technology sponsors.',
          },
          {
            time: '11:00 – 11:30',
            title: '1-on-1 Interviews & Photo Opportunity',
            description: 'Dedicated interview slots with speakers and VIP tour of preview booths.',
          },
        ],
      },
      pressReleasesIntro:
        'Official statements and announcements issued by the Son Tra Innovation Fest organizing committee.',
      pressReleases: [
        {
          title: 'Son Tra Innovation Fest 2026 officially launches in Da Nang',
          date: '2026-09-01',
          category: 'Announcement',
          summary:
            'Over 5,000 attendees, 50 tech enterprises, and international delegations will gather on the Son Tra waterfront this October.',
          externalUrl: 'https://innovationfest.vn/news/official-launch',
        },
        {
          title:
            'Strategic partnership announced with Da Nang Startup & Innovation Support Center (DISSC)',
          date: '2026-09-12',
          category: 'Partnership',
          summary:
            'A multi-year agreement to foster startup acceleration, green technology incubation, and digital governance across the region.',
          externalUrl: 'https://innovationfest.vn/news/dissc-partnership',
        },
        {
          title: 'SIF 2026 unveils two flagship competitions for young tech innovators',
          date: '2026-09-20',
          category: 'Competition',
          summary:
            'Total prize pool of 300,000,000 VND across AI Innovation Challenge and Smart Coastal City Hackathon.',
          externalUrl: 'https://innovationfest.vn/news/flagship-competitions',
        },
      ],
      mediaKitIntro:
        'Download official branding elements, high-resolution logos, fact sheets, and event presentation decks.',
      mediaKitItems: [
        {
          title: 'Official SIF 2026 Logo Pack',
          description: 'Vector and raster logos in color, white, and dark variants (AI, SVG, PNG).',
          category: 'logo',
          fileLabel: 'ZIP · 18 MB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-logos',
        },
        {
          title: 'Brand Identity Guidelines',
          description:
            'Design specifications, typography, color palette, and co-branding usage rules.',
          category: 'guidelines',
          fileLabel: 'PDF · 8.4 MB',
          externalUrl: 'https://drive.google.com/file/d/sif2026-guidelines',
        },
        {
          title: 'SIF 2026 Executive Fact Sheet',
          description:
            'Key figures, participating delegations, venue specifications, and agenda overview.',
          category: 'fact-sheet',
          fileLabel: 'PDF · 3.2 MB',
          externalUrl: 'https://drive.google.com/file/d/sif2026-factsheet',
        },
        {
          title: 'Key Visual & Digital Backdrops',
          description: 'High-resolution posters, horizontal banners, and stage visual assets.',
          category: 'key-visual',
          fileLabel: 'ZIP · 42 MB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-keyvisuals',
        },
        {
          title: 'Official Teaser & B-Roll Footage',
          description:
            'Broadcast-ready 4K video clips, festival highlights, and drone shots of Son Tra.',
          category: 'video',
          fileLabel: 'MP4 / ProRes · 1.2 GB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-broll',
        },
      ],
      mediaKitUsage: paragraphs(
        'All official brand assets, logos, and materials are copyrighted by Son Tra Innovation Fest.',
        'Assets may be used freely for editorial coverage, news reporting, and partner promotions directly related to SIF 2026.',
        'Please do not alter colors, distort aspect ratios, or use the event marks to imply unauthorized commercial endorsement.',
      ),
      photosIntro:
        'High-resolution editorial photography from Son Tra Innovation Fest. Updated in real-time throughout the festival days.',
      photoCredit: 'Photo: Son Tra Innovation Fest / Media Team',
      photoDriveUrl: 'https://drive.google.com/drive/folders/sif2026-official-photos',
      photoAlbums: [
        {
          title: 'Day 1 — Grand Opening & Tech Keynotes',
          date: '2026-10-02',
          description:
            'Ribbon cutting ceremony, VIP tour of innovation booths, and opening plenary sessions.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day1',
          photoCount: 168,
        },
        {
          title: 'Day 2 — FinTech Forum & Startup Showcase',
          date: '2026-10-03',
          description:
            'Panels on digital assets, green banking, and live pitch demos from 24 tech startups.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day2',
          photoCount: 215,
        },
        {
          title: 'Day 3 — Hackathon Finals & Awards Gala',
          date: '2026-10-04',
          description:
            'Final project presentations, awards ceremony, and festival closing networking party.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day3',
          photoCount: 194,
        },
        {
          title: 'Exhibition Highlights & Interactive Demos',
          date: '2026-10-03',
          description:
            'Visitors exploring robotics, VR/AR experiences, and smart living pavilions.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-exhibition',
          photoCount: 142,
        },
      ],
      seo: {
        metaTitle: 'Media Center — Son Tra Innovation Fest 2026',
        metaDescription:
          'Press releases, press conference accreditation, media kit and official photography for SIF 2026.',
      },
    },
    {
      heroTitle: 'Trung tâm Báo chí & Truyền thông',
      heroSubtitle:
        'Tài liệu chính thức, thông cáo báo chí, đăng ký tác nghiệp và hình ảnh chất lượng cao dành cho các cơ quan thông tấn, báo chí đưa tin về Son Tra Innovation Fest 2026.',
      pressContactName: 'Ban Truyền thông SIF 2026 — Ms. Hoàng Lan',
      pressConference: {
        title: 'Họp báo công bố sự kiện Son Tra Innovation Fest 2026',
        summary:
          'Gặp gỡ ban tổ chức và các chuyên gia công nghệ hàng đầu tại buổi họp báo công bố chính thức về quy mô, diễn giả chủ chốt và các hoạt động hợp tác công nghệ nổi bật.',
        startsAt: '2026-09-25T02:00:00.000Z',
        endsAt: '2026-09-25T04:30:00.000Z',
        venue: 'Hội trường Grand Ballroom, Khách sạn Wyndham Danang Golden Bay',
        address: '171–173 Trần Hưng Đạo, Quận Sơn Trà, TP. Đà Nẵng',
        registrationUrl: 'https://forms.gle/sif2026-media-accreditation',
        registrationLabel: 'Đăng ký thẻ tác nghiệp báo chí',
        accreditation: paragraphs(
          'Thẻ tác nghiệp báo chí dành cho các phóng viên, nhà báo, biên tập viên, nhiếp ảnh gia và các kênh truyền thông chuyên trách về công nghệ, đổi mới sáng tạo và kinh tế.',
          'Vui lòng gửi thông tin đăng ký trước ít nhất 48 giờ trước thời điểm diễn ra họp báo. Thẻ tác nghiệp sẽ được phát tại bàn tiếp đón báo chí khi xuất trình thẻ nhà báo hoặc giấy giới thiệu của cơ quan báo chí.',
        ),
        schedule: [
          {
            time: '08:30 – 09:00',
            title: 'Đón tiếp & Phát thẻ tác nghiệp',
            description: 'Nhận thẻ báo chí, tài liệu truyền thông và dùng trà chào mừng.',
          },
          {
            time: '09:00 – 09:30',
            title: 'Phát biểu khai mạc & Giới thiệu tổng quan lễ hội',
            description:
              'Ban tổ chức trình bày về chủ đề, quy mô và các đoàn đại biểu tham gia SIF 2026.',
          },
          {
            time: '09:30 – 10:15',
            title: 'Công bố chuyên đề: Hành lang FinTech & Công nghệ xanh Đà Nẵng',
            description:
              'Định hướng phát triển kết nối cùng Trung tâm Tài chính Quốc tế Đà Nẵng (DIFC).',
          },
          {
            time: '10:15 – 11:00',
            title: 'Phiên hỏi đáp (Q&A) cùng Ban tổ chức & Đối tác',
            description:
              'Trao đổi trực tiếp giữa phóng viên với lãnh đạo quận Sơn Trà, DISSC và các đơn vị đồng hành.',
          },
          {
            time: '11:00 – 11:30',
            title: 'Phỏng vấn độc quyền & Chụp ảnh lưu niệm',
            description:
              'Khung phỏng vấn riêng với diễn giả và tham quan trước các gian hàng tiêu biểu.',
          },
        ],
      },
      pressReleasesIntro:
        'Thông tin và thông cáo chính thức được phát hành bởi Ban tổ chức Son Tra Innovation Fest.',
      pressReleases: [
        {
          title: 'Chính thức công bố Lễ hội Đổi mới Sáng tạo Sơn Trà – SIF 2026',
          date: '2026-09-01',
          category: 'Thông báo',
          summary:
            'Dự kiến quy tụ hơn 5.000 lượt khách, 50 doanh nghiệp công nghệ và các đoàn đối tác quốc tế vào tháng 10/2026.',
          externalUrl: 'https://innovationfest.vn/vi/news/chinh-thuc-cong-bo',
        },
        {
          title: 'Ký kết hợp tác chiến lược cùng Trung tâm Khởi nghiệp ĐMST Đà Nẵng (DISSC)',
          date: '2026-09-12',
          category: 'Hợp tác',
          summary:
            'Thỏa thuận hợp tác thúc đẩy ươm tạo startup, công nghệ xanh và chuyển đổi số cho khu vực miền Trung.',
          externalUrl: 'https://innovationfest.vn/vi/news/hop-tac-dissc',
        },
        {
          title: 'Công bố 02 cuộc thi sáng tạo công nghệ dành cho tài năng trẻ tại SIF 2026',
          date: '2026-09-20',
          category: 'Cuộc thi',
          summary:
            'Tổng giá trị giải thưởng lên tới 300.000.000 VNĐ cho hai bảng đấu: AI Innovation Challenge và Smart Coastal City Hackathon.',
          externalUrl: 'https://innovationfest.vn/vi/news/cong-bo-cuoc-thi',
        },
      ],
      mediaKitIntro:
        'Tải về trọn bộ nhận diện thương hiệu, logo chất lượng cao, tài liệu giới thiệu và ấn phẩm sự kiện.',
      mediaKitItems: [
        {
          title: 'Bộ nhận diện Logo SIF 2026',
          description:
            'Các phiên bản logo định dạng vector và raster trên nền sáng/tối (AI, SVG, PNG).',
          category: 'logo',
          fileLabel: 'ZIP · 18 MB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-logos',
        },
        {
          title: 'Cẩm nang quy chuẩn thương hiệu',
          description: 'Quy chuẩn thiết kế, hệ màu sắc, font chữ và hướng dẫn đồng thương hiệu.',
          category: 'guidelines',
          fileLabel: 'PDF · 8.4 MB',
          externalUrl: 'https://drive.google.com/file/d/sif2026-guidelines',
        },
        {
          title: 'Tài liệu tổng quan sự kiện (Fact Sheet)',
          description:
            'Các số liệu chủ chốt, danh sách đại biểu, thông số mặt bằng và lịch trình tóm tắt.',
          category: 'fact-sheet',
          fileLabel: 'PDF · 3.2 MB',
          externalUrl: 'https://drive.google.com/file/d/sif2026-factsheet',
        },
        {
          title: 'Bộ hình ảnh chủ đạo (Key Visual)',
          description: 'Poster độ phân giải cao, banner ngang và visual trình chiếu sân khấu.',
          category: 'key-visual',
          fileLabel: 'ZIP · 42 MB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-keyvisuals',
        },
        {
          title: 'Video Teaser & Tư liệu B-Roll',
          description:
            'Video chất lượng 4K phục vụ phát sóng truyền hình, highlight và flycam Sơn Trà.',
          category: 'video',
          fileLabel: 'MP4 / ProRes · 1.2 GB',
          externalUrl: 'https://drive.google.com/drive/folders/sif2026-broll',
        },
      ],
      mediaKitUsage: paragraphs(
        'Toàn bộ tài nguyên thương hiệu, logo và tư liệu thuộc bản quyền của Ban tổ chức Son Tra Innovation Fest.',
        'Các đơn vị báo chí và đối tác được quyền sử dụng miễn phí cho mục đích đưa tin, xuất bản bài viết và truyền thông liên quan đến sự kiện.',
        'Không thay đổi màu sắc, không bóp méo tỷ lệ logo hoặc sử dụng nhận diện sự kiện cho mục đích thương mại khi chưa có văn bản chấp thuận.',
      ),
      photosIntro:
        'Kho ảnh chất lượng cao phục vụ báo chí tại Son Tra Innovation Fest. Được cập nhật liên tục theo thời gian thực trong suốt các ngày diễn ra sự kiện.',
      photoCredit: 'Ảnh: Ban Truyền thông Son Tra Innovation Fest',
      photoAlbums: [
        {
          title: 'Ngày 1 — Lễ Khai mạc & Toạ đàm Công nghệ',
          date: '2026-10-02',
          description:
            'Lễ cắt băng khai mạc, đón tiếp đoàn đại biểu tham quan gian hàng và các phiên toàn thể.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day1',
          photoCount: 168,
        },
        {
          title: 'Ngày 2 — Diễn đàn FinTech & Trình diễn Khởi nghiệp',
          date: '2026-10-03',
          description:
            'Thảo luận tài chính số, ngân hàng xanh và phần thuyết trình dự án của 24 startup công nghệ.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day2',
          photoCount: 215,
        },
        {
          title: 'Ngày 3 — Chung kết Hackathon & Lễ Bế mạc',
          date: '2026-10-04',
          description:
            'Phần tranh tài chung kết, lễ trao giải vinh danh và tiệc giao lưu bế mạc lễ hội.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-day3',
          photoCount: 194,
        },
        {
          title: 'Không gian Triển lãm & Trải nghiệm Tương tác',
          date: '2026-10-03',
          description:
            'Khách tham quan trải nghiệm robot, kính thực tế ảo VR/AR và các gian hàng phong cách sống thông minh.',
          driveUrl: 'https://drive.google.com/drive/folders/sif2026-exhibition',
          photoCount: 142,
        },
      ],
      seo: {
        metaTitle: 'Trung tâm Báo chí — Son Tra Innovation Fest 2026',
        metaDescription:
          'Thông cáo báo chí, đăng ký tác nghiệp họp báo, bộ tài liệu truyền thông và hình ảnh sự kiện SIF 2026.',
      },
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
      vi: {
        title: 'Xây dựng sản phẩm cho thị trường Việt Nam',
        track: 'Sản phẩm',
        location: 'Hội trường B',
      },
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
        order: 1,
      },
      vi: { category: 'Phần cứng', description: 'Mục triển lãm mẫu.' },
    },
    {
      en: {
        companyName: 'Placeholder AI Lab',
        boothNumber: 'B-14',
        category: 'Software',
        description: 'Sample exhibitor entry.',
        order: 2,
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
