import { Language } from '../hooks/use-ui';

type Translations = Record<Language, any>;

export const translations: Translations = {
  pt: {
    nav: {
      createEvent: 'Criar evento',
      myTickets: 'Meus ingressos',
      searchPlaceholder: 'O que você procura?',
      location: 'Localização',
      cityCountry: 'Cidade ou país',
      search: 'Buscar'
    },
    home: {
      categories: 'Categorias',
      categoriesSubtitle: 'Encontre o evento perfeito para seu momento.',
      nextEvents: 'Próximos Eventos',
      nextEventsSubtitle: 'As melhores experiências selecionadas para você.',
      viewAll: 'Ver todos',
      faq: 'Dúvidas Frequentes',
      faqSubtitle: 'Tudo o que você precisa saber sobre a Zevva Tickets.'
    }
  },
  en: {
    nav: {
      createEvent: 'Create event',
      myTickets: 'My tickets',
      searchPlaceholder: 'What are you looking for?',
      location: 'Location',
      cityCountry: 'City or country',
      search: 'Search'
    },
    home: {
      categories: 'Categories',
      categoriesSubtitle: 'Find the perfect event for your moment.',
      nextEvents: 'Upcoming Events',
      nextEventsSubtitle: 'The best experiences curated for you.',
      viewAll: 'View all',
      faq: 'FAQ',
      faqSubtitle: 'Everything you need to know about Zevva Tickets.'
    }
  },
  es: {
    nav: {
      createEvent: 'Crear evento',
      myTickets: 'Mis boletos',
      searchPlaceholder: '¿Qué estás buscando?',
      location: 'Ubicación',
      cityCountry: 'Ciudad o país',
      search: 'Buscar'
    },
    home: {
      categories: 'Categorías',
      categoriesSubtitle: 'Encuentra el evento perfecto para tu momento.',
      nextEvents: 'Próximos Eventos',
      nextEventsSubtitle: 'Las mejores experiencias seleccionadas para ti.',
      viewAll: 'Ver todos',
      faq: 'Preguntas Frecuentes',
      faqSubtitle: 'Todo lo que necesitas saber sobre Zevva Tickets.'
    }
  },
  ja: {
    nav: {
      createEvent: 'イベントを作成',
      myTickets: 'マイチケット',
      searchPlaceholder: '何をお探しですか？',
      location: '場所',
      cityCountry: '都市または国',
      search: '検索'
    },
    home: {
      categories: 'カテゴリー',
      categoriesSubtitle: 'あなたにぴったりのイベントを見つけましょう。',
      nextEvents: '今後のイベント',
      nextEventsSubtitle: '厳選された最高の体験をお届けします。',
      viewAll: 'すべて見る',
      faq: 'よくある質問',
      faqSubtitle: 'Zevva Ticketsについて知っておくべきすべてのこと。'
    }
  },
  zh: {
    nav: {
      createEvent: '创建活动',
      myTickets: '我的门票',
      searchPlaceholder: '你在找什么？',
      location: '地点',
      cityCountry: '城市或国家',
      search: '搜索'
    },
    home: {
      categories: '类别',
      categoriesSubtitle: '为您找到完美的活动。',
      nextEvents: '即将举行的活动',
      nextEventsSubtitle: '为您精心挑选的最佳体验。',
      viewAll: '查看全部',
      faq: '常见问题',
      faqSubtitle: '您需要了解的有关 Zevva Tickets 的一切。'
    }
  },
  ar: {
    nav: {
      createEvent: 'إنشاء حدث',
      myTickets: 'تذاكري',
      searchPlaceholder: 'عن ماذا تبحث؟',
      location: 'الموقع',
      cityCountry: 'المدينة أو الدولة',
      search: 'بحث'
    },
    home: {
      categories: 'الفئات',
      categoriesSubtitle: 'اعثر على الحدث المثالي للحظتك.',
      nextEvents: 'الفعاليات القادمة',
      nextEventsSubtitle: 'أفضل التجارب المنسقة لك.',
      viewAll: 'عرض الكل',
      faq: 'الأسئلة الشائعة',
      faqSubtitle: 'كل ما تحتاج لمعرفته حول Zevva Tickets.'
    }
  }
};
