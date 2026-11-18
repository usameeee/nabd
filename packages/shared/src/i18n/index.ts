import type { Locale } from '../types/roles';

// Default language is Arabic; French then English are the fallback layers (docs/02).
export const DEFAULT_LOCALE: Locale = 'ar';
export const FALLBACK_LOCALES: Locale[] = ['fr', 'en'];

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}

// All user-facing strings live here — screens must never hardcode them (AGENTS.md).
export interface TranslationResources {
  // The wordmark is a brand asset: نبض stays primary and "Nabd" the Latin name in every locale.
  app: { name: string; wordmark: string; latinWordmark: string };
  home: {
    promise: string;
    languageLabel: string;
    greeting: string;
    xpLabel: string;
    todayLesson: string;
    lessonTitle: string;
    continue: string;
    learnYourWay: string;
    termOfDay: string;
    interaction: { model: string; clinicalCase: string; video: string; quiz: string };
  };
  language: Record<Locale, string>;
  tabs: { home: string; learn: string; review: string; profile: string };
  // Term card (docs/01): AR title → FR → EN, plus the speaker button.
  term: { speak: string };
  // Admin dashboard (team-facing) — same key-based rule as the app.
  admin: {
    brandLabel: string;
    nav: {
      overview: string;
      organs: string;
      terms: string;
      lessons: string;
      cases: string;
      quizzes: string;
      users: string;
      settings: string;
    };
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      failed: string;
    };
    session: { signedInAs: string; signOut: string; comingSoon: string };
    terms: {
      newTerm: string;
      search: string;
      category: string;
      status: string;
      all: string;
      languages: string;
      total: string;
      pending: string;
      verified: string;
      colAr: string;
      colFr: string;
      colEn: string;
      colSource: string;
      colStatus: string;
      statusDraft: string;
      statusNeedsReview: string;
      statusVerified: string;
      empty: string;
      edit: string;
      page: string;
      previous: string;
      next: string;
      createTitle: string;
      editTitle: string;
      keyLabel: string;
      keyHint: string;
      ar: string;
      fr: string;
      en: string;
      latin: string;
      source: string;
      sourceRef: string;
      license: string;
      attribution: string;
      optional: string;
      save: string;
      saving: string;
      cancel: string;
      error: string;
    };
  };
}

export const translations: Record<Locale, TranslationResources> = {
  ar: {
    app: { name: 'نبض', wordmark: 'نبض', latinWordmark: 'Nabd' },
    home: {
      promise: 'تعلّم الطب بالتفاعل',
      languageLabel: 'اللغة',
      greeting: 'مرحباً {{name}}',
      xpLabel: 'XP',
      todayLesson: 'درس اليوم',
      lessonTitle: 'القلب والدورة الدموية',
      continue: 'تابع',
      learnYourWay: 'تعلّم بطريقتك',
      termOfDay: 'مصطلح اليوم',
      interaction: {
        model: 'مجسم 3D',
        clinicalCase: 'حالة سريرية',
        video: 'فيديو عملي',
        quiz: 'اختبار سريع',
      },
    },
    language: { ar: 'العربية', fr: 'Français', en: 'English' },
    tabs: { home: 'الرئيسية', learn: 'تعلّم', review: 'مراجعة', profile: 'الملف' },
    term: { speak: 'استمع إلى النطق' },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'نظرة عامة',
        organs: 'الأعضاء والمجسّمات',
        terms: 'المصطلحات والترجمة',
        lessons: 'الدروس',
        cases: 'الحالات والفيديوهات',
        quizzes: 'الاختبارات',
        users: 'المستخدمون',
        settings: 'الإعدادات',
      },
      login: {
        title: 'تسجيل الدخول',
        subtitle: 'إدارة محتوى نبض',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        submit: 'تسجيل الدخول',
        submitting: 'جارٍ تسجيل الدخول…',
        failed: 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.',
      },
      session: {
        signedInAs: 'مسجّل الدخول باسم',
        signOut: 'تسجيل الخروج',
        comingSoon: 'هذا القسم قادم قريباً.',
      },
      terms: {
        newTerm: 'مصطلح جديد',
        search: 'ابحث عن مصطلح…',
        category: 'الفئة',
        status: 'الحالة',
        all: 'الكل',
        languages: 'AR · FR · EN',
        total: 'إجمالي المصطلحات',
        pending: 'بانتظار المراجعة',
        verified: 'موثّق',
        colAr: 'عربي',
        colFr: 'Français',
        colEn: 'English',
        colSource: 'المصدر',
        colStatus: 'الحالة',
        statusDraft: 'مسودة',
        statusNeedsReview: 'قيد المراجعة',
        statusVerified: 'موثّق',
        empty: 'لا توجد مصطلحات.',
        edit: 'تعديل',
        page: 'صفحة',
        previous: 'السابق',
        next: 'التالي',
        createTitle: 'مصطلح جديد',
        editTitle: 'تعديل مصطلح',
        keyLabel: 'المفتاح (snake_case)',
        keyHint: 'أحرف صغيرة، مثال left_ventricle. لا يمكن تغييره لاحقاً.',
        ar: 'العربية',
        fr: 'الفرنسية',
        en: 'الإنجليزية',
        latin: 'اللاتينية',
        source: 'المصدر',
        sourceRef: 'مرجع المصدر',
        license: 'الترخيص',
        attribution: 'الإسناد',
        optional: 'اختياري',
        save: 'حفظ',
        saving: 'جارٍ الحفظ…',
        cancel: 'إلغاء',
        error: 'تعذّر حفظ المصطلح.',
      },
    },
  },
  fr: {
    app: { name: 'Nabd', wordmark: 'نبض', latinWordmark: 'Nabd' },
    home: {
      promise: 'Apprends la médecine en interagissant',
      languageLabel: 'Langue',
      greeting: 'Bonjour {{name}}',
      xpLabel: 'XP',
      todayLesson: 'Leçon du jour',
      lessonTitle: 'Le cœur et la circulation',
      continue: 'Continuer',
      learnYourWay: 'Apprends à ta façon',
      termOfDay: 'Terme du jour',
      interaction: {
        model: 'Modèle 3D',
        clinicalCase: 'Cas clinique',
        video: 'Vidéo pratique',
        quiz: 'Quiz rapide',
      },
    },
    language: { ar: 'العربية', fr: 'Français', en: 'English' },
    tabs: { home: 'Accueil', learn: 'Apprendre', review: 'Révision', profile: 'Profil' },
    term: { speak: 'Écouter la prononciation' },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'Vue d’ensemble',
        organs: 'Organes et modèles',
        terms: 'Termes et traduction',
        lessons: 'Leçons',
        cases: 'Cas et vidéos',
        quizzes: 'Quiz',
        users: 'Utilisateurs',
        settings: 'Paramètres',
      },
      login: {
        title: 'Connexion',
        subtitle: 'Gérer le contenu Nabd',
        email: 'E-mail',
        password: 'Mot de passe',
        submit: 'Se connecter',
        submitting: 'Connexion…',
        failed: 'Échec de la connexion. Vérifiez l’e-mail et le mot de passe.',
      },
      session: {
        signedInAs: 'Connecté en tant que',
        signOut: 'Se déconnecter',
        comingSoon: 'Cette section arrive bientôt.',
      },
      terms: {
        newTerm: 'Nouveau terme',
        search: 'Rechercher un terme…',
        category: 'Catégorie',
        status: 'Statut',
        all: 'Tous',
        languages: 'AR · FR · EN',
        total: 'Total des termes',
        pending: 'En attente de validation',
        verified: 'Vérifiés',
        colAr: 'عربي',
        colFr: 'Français',
        colEn: 'English',
        colSource: 'Source',
        colStatus: 'Statut',
        statusDraft: 'Brouillon',
        statusNeedsReview: 'En relecture',
        statusVerified: 'Vérifié',
        empty: 'Aucun terme trouvé.',
        edit: 'Modifier',
        page: 'Page',
        previous: 'Précédent',
        next: 'Suivant',
        createTitle: 'Nouveau terme',
        editTitle: 'Modifier le terme',
        keyLabel: 'Clé (snake_case)',
        keyHint: 'En minuscules, ex. left_ventricle. Non modifiable ensuite.',
        ar: 'Arabe',
        fr: 'Français',
        en: 'Anglais',
        latin: 'Latin',
        source: 'Source',
        sourceRef: 'Référence de source',
        license: 'Licence',
        attribution: 'Attribution',
        optional: 'facultatif',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        cancel: 'Annuler',
        error: 'Impossible d’enregistrer le terme.',
      },
    },
  },
  en: {
    app: { name: 'Nabd', wordmark: 'نبض', latinWordmark: 'Nabd' },
    home: {
      promise: 'Learn medicine through interaction',
      languageLabel: 'Language',
      greeting: 'Hi {{name}}',
      xpLabel: 'XP',
      todayLesson: "Today's lesson",
      lessonTitle: 'Heart and circulation',
      continue: 'Continue',
      learnYourWay: 'Learn your way',
      termOfDay: 'Term of the day',
      interaction: {
        model: '3D model',
        clinicalCase: 'Clinical case',
        video: 'Practical video',
        quiz: 'Quick quiz',
      },
    },
    language: { ar: 'العربية', fr: 'Français', en: 'English' },
    tabs: { home: 'Home', learn: 'Learn', review: 'Review', profile: 'Profile' },
    term: { speak: 'Listen to pronunciation' },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'Overview',
        organs: 'Organs & models',
        terms: 'Terms & translation',
        lessons: 'Lessons',
        cases: 'Cases & videos',
        quizzes: 'Quizzes',
        users: 'Users',
        settings: 'Settings',
      },
      login: {
        title: 'Sign in',
        subtitle: 'Manage Nabd content',
        email: 'Email',
        password: 'Password',
        submit: 'Sign in',
        submitting: 'Signing in…',
        failed: 'Sign-in failed. Check your email and password.',
      },
      session: {
        signedInAs: 'Signed in as',
        signOut: 'Sign out',
        comingSoon: 'This section is coming soon.',
      },
      terms: {
        newTerm: 'New term',
        search: 'Search terms…',
        category: 'Category',
        status: 'Status',
        all: 'All',
        languages: 'AR · FR · EN',
        total: 'Total terms',
        pending: 'Awaiting review',
        verified: 'Verified',
        colAr: 'عربي',
        colFr: 'Français',
        colEn: 'English',
        colSource: 'Source',
        colStatus: 'Status',
        statusDraft: 'Draft',
        statusNeedsReview: 'Needs review',
        statusVerified: 'Verified',
        empty: 'No terms found.',
        edit: 'Edit',
        page: 'Page',
        previous: 'Previous',
        next: 'Next',
        createTitle: 'New term',
        editTitle: 'Edit term',
        keyLabel: 'Key (snake_case)',
        keyHint: 'Lowercase, e.g. left_ventricle. Cannot be changed later.',
        ar: 'Arabic',
        fr: 'French',
        en: 'English',
        latin: 'Latin',
        source: 'Source',
        sourceRef: 'Source reference',
        license: 'License',
        attribution: 'Attribution',
        optional: 'optional',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        error: 'Could not save the term.',
      },
    },
  },
};
