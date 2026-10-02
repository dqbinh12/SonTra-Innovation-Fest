/** Populate workshop documents in the Media Center without overwriting existing entries. */
import { compileStrapi, createStrapi, type Core } from '@strapi/strapi';

const uid = 'api::media-page.media-page' as Parameters<Core.Strapi['documents']>[0];

const documentsData = {
  vi: {
    intro:
      'Toàn bộ bài tham luận, tài liệu chuyên đề và báo cáo tổng kết được các diễn giả, chuyên gia chia sẻ tại các phiên hội thảo của Son Tra Innovation Fest.',
    url: 'https://drive.google.com',
    documents: [
      {
        title: 'Báo cáo Toàn cảnh Đổi mới Sáng tạo & Công nghệ Sơn Trà 2026',
        speaker: 'DISSC & Ban Cố vấn Chiến lược SIF',
        category: 'Báo cáo tổng hợp',
        summary:
          'Khảo sát và đánh giá hệ sinh thái khởi nghiệp, tiềm năng ứng dụng công nghệ số và định hướng phát triển lối sống xanh tại khu vực Sơn Trà.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'PDF · 4.8 MB',
      },
      {
        title: 'Tham luận: Hạ tầng FinTech & Trung tâm Tài chính Quốc tế Đà Nẵng (DIFC)',
        speaker: 'Hiệp hội Doanh nghiệp & Chuyên gia FinTech',
        category: 'Công nghệ Tài chính',
        summary:
          'Mô hình kết nối dịch vụ tài chính thế hệ mới, thử nghiệm chính sách sandbox và cơ hội dành cho doanh nghiệp công nghệ trong nước.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'SLIDES · 12.5 MB',
      },
      {
        title: 'Kỷ yếu Tọa đàm: Trí tuệ Nhân tạo & Chuyển đổi số Doanh nghiệp Địa phương',
        speaker: 'Đại diện các Viện nghiên cứu & Doanh nghiệp Hội viên',
        category: 'Hội thảo chuyên đề',
        summary:
          'Tập hợp các giải pháp ứng dụng AI thực tế dành cho doanh nghiệp du lịch, dịch vụ và vận hành đô thị ven sông.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'PDF · 3.2 MB',
      },
    ],
  },
  en: {
    intro:
      'Access keynote presentation decks, policy briefs and research papers presented by speakers and specialists across all festival tracks.',
    url: 'https://drive.google.com',
    documents: [
      {
        title: 'Son Tra Innovation & Technology Ecosystem Report 2026',
        speaker: 'DISSC & SIF Strategic Advisory Board',
        category: 'Ecosystem Report',
        summary:
          'Comprehensive overview of the regional tech startup landscape, digital adoption and green living initiatives across Son Tra.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'PDF · 4.8 MB',
      },
      {
        title: 'Keynote: FinTech Infrastructure & Da Nang International Financial Center',
        speaker: 'FinTech Industry Working Group',
        category: 'FinTech & Banking',
        summary:
          'Frameworks for next-generation financial services, sandbox testbeds and opportunities for cross-border collaboration.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'SLIDES · 12.5 MB',
      },
      {
        title: 'Workshop Proceedings: Applied AI & Local Enterprise Modernization',
        speaker: 'Participating Research Labs & Member Enterprises',
        category: 'Specialist Workshop',
        summary:
          'Practical artificial intelligence playbooks tailored for hospitality, urban services and waterfront business operations.',
        externalUrl: 'https://drive.google.com',
        fileLabel: 'PDF · 3.2 MB',
      },
    ],
  },
};

async function seedWorkshopDocs(strapi: Core.Strapi) {
  for (const locale of ['en', 'vi'] as const) {
    const page = await strapi.documents(uid).findFirst({ locale, status: 'published' });
    if (!page) {
      strapi.log.warn(`[workshop-docs] No published Media Page found for locale ${locale}`);
      continue;
    }

    const documents = strapi.documents(uid) as any;
    const existing = await documents.findOne({
      documentId: page.documentId,
      locale,
      status: 'published',
      populate: { workshopDocuments: true },
    });

    if (existing?.workshopDocuments?.length) {
      strapi.log.info(
        `[workshop-docs] ${locale} already has ${existing.workshopDocuments.length} workshop documents, skipping`,
      );
      continue;
    }

    const payload = documentsData[locale];
    await documents.update({
      documentId: page.documentId,
      locale,
      status: 'published',
      data: {
        workshopDocumentsIntro: payload.intro,
        workshopDocumentsUrl: payload.url,
        workshopDocuments: payload.documents,
      },
    });

    strapi.log.info(`[workshop-docs] populated ${locale}`);
  }
}

async function main() {
  const appContext = await compileStrapi();
  const strapi = await createStrapi(appContext).load();
  await seedWorkshopDocs(strapi);
  await strapi.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
