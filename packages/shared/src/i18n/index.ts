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
  // Short codes for the compact viewer switcher (ع | FR | EN). Constant across locales, like the wordmark.
  languageShort: Record<Locale, string>;
  tabs: { home: string; learn: string; review: string; profile: string };
  // Term card (docs/01): AR title → FR → EN, plus the speaker button.
  term: { speak: string };
  // 3D viewer (docs/01). The organ label is a medical term: AR is primary and the
  // FR · EN subtitle stays French/English in every locale, so those two are identical.
  viewer: {
    back: string;
    organTitle: string;
    organSubtitle: string;
    loading: string;
    hint: string;
    close: string;
    // Viewer tabs (T-041): anatomy (hotspots) + diseases (stage slider). The mockup's "function"
    // tab is deferred until there is content for it.
    tabs: { anatomy: string; diseases: string };
    // Disease panel (T-041): the ICD-11 badge, the symptoms heading and the two actions.
    icd11: string;
    symptoms: string;
    startQuiz: string;
    watch: string;
    // Layer chips (T-035). Only the layers this model supports get a label (docs/03 layers).
    layers: { muscles: string; vessels: string; skeleton: string; nerves: string };
  };
  // Admin dashboard (team-facing) — same key-based rule as the app.
  admin: {
    brandLabel: string;
    nav: {
      overview: string;
      organs: string;
      terms: string;
      diseases: string;
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
    models: {
      selectPrompt: string;
      newModel: string;
      editModel: string;
      empty: string;
      createTitle: string;
      editTitle: string;
      key: string;
      keyHint: string;
      titleTermKey: string;
      system: string;
      status: string;
      versions: string;
      light: string;
      detailed: string;
      url: string;
      sizeBytes: string;
      polyCount: string;
      layers: string;
      meshNames: string;
      license: string;
      attribution: string;
      sourceUrl: string;
      optional: string;
      save: string;
      saving: string;
      cancel: string;
      error: string;
      statusDraft: string;
      statusVerified: string;
      publish: string;
      unpublish: string;
      hotspots: string;
      newHotspot: string;
      noHotspots: string;
      point: string;
      selectHotspot: string;
      linkedTerm: string;
      layer: string;
      order: string;
      position: string;
      camera: string;
      cameraPosition: string;
      cameraTarget: string;
      cameraZoom: string;
      meshName: string;
      edit: string;
      deleteHotspot: string;
      confirmDeleteHotspot: string;
      versionsLicense: string;
      lightHint: string;
      detailedHint: string;
      attributionRequired: string;
      none: string;
      createHotspotTitle: string;
      editHotspotTitle: string;
      termKeyHint: string;
      errorHotspot: string;
    };
    diseases: {
      newDisease: string;
      search: string;
      status: string;
      all: string;
      empty: string;
      edit: string;
      page: string;
      previous: string;
      next: string;
      colKey: string;
      colTerm: string;
      colModel: string;
      colStages: string;
      colStatus: string;
      createTitle: string;
      editTitle: string;
      key: string;
      keyHint: string;
      termKey: string;
      termKeyHint: string;
      modelKey: string;
      modelKeyHint: string;
      icd11Code: string;
      icd11Uri: string;
      symptoms: string;
      symptomsHint: string;
      stages: string;
      noStages: string;
      addStage: string;
      stageKey: string;
      stageLabelTermKey: string;
      highlightMeshes: string;
      vesselNarrowing: string;
      materialOverrides: string;
      materialOverridesHint: string;
      removeStage: string;
      videos: string;
      videosHint: string;
      quizId: string;
      publish: string;
      unpublish: string;
      optional: string;
      save: string;
      saving: string;
      cancel: string;
      error: string;
      statusDraft: string;
      statusNeedsReview: string;
      statusVerified: string;
    };
    lessons: {
      newLesson: string;
      search: string;
      status: string;
      all: string;
      empty: string;
      edit: string;
      page: string;
      previous: string;
      next: string;
      colKey: string;
      colTitle: string;
      colUnit: string;
      colOrder: string;
      colSteps: string;
      colStatus: string;
      createTitle: string;
      editTitle: string;
      key: string;
      keyHint: string;
      titleAr: string;
      titleFr: string;
      titleEn: string;
      unit: string;
      unitHint: string;
      order: string;
      orderHint: string;
      faculty: string;
      year: string;
      yearHint: string;
      steps: string;
      noSteps: string;
      addStep: string;
      removeStep: string;
      stepType: string;
      stepXp: string;
      stepRef: string;
      refModelKey: string;
      refDiseaseKey: string;
      refHotspotIds: string;
      refVideoId: string;
      refCaseId: string;
      refQuizId: string;
      termKeys: string;
      termKeysHint: string;
      optional: string;
      save: string;
      saving: string;
      cancel: string;
      error: string;
      statusDraft: string;
      statusNeedsReview: string;
      statusVerified: string;
      stepTypes: { explain: string; viewer: string; video: string; case: string; quiz: string };
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
    languageShort: { ar: 'ع', fr: 'FR', en: 'EN' },
    tabs: { home: 'الرئيسية', learn: 'تعلّم', review: 'مراجعة', profile: 'الملف' },
    term: { speak: 'استمع إلى النطق' },
    viewer: {
      back: 'رجوع إلى الرئيسية',
      organTitle: 'القلب',
      organSubtitle: 'Cœur · Heart',
      loading: 'جارٍ تحميل المجسّم…',
      hint: 'اسحب للتدوير · اقرص للتقريب',
      close: 'إغلاق',
      tabs: { anatomy: 'التشريح', diseases: 'الأمراض' },
      icd11: 'ICD-11',
      symptoms: 'الأعراض الرئيسية',
      startQuiz: 'ابدأ اختباراً',
      watch: 'شاهد العملية',
      layers: { muscles: 'العضلات', vessels: 'الأوعية', skeleton: 'الهيكل', nerves: 'الأعصاب' },
    },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'نظرة عامة',
        organs: 'الأعضاء والمجسّمات',
        terms: 'المصطلحات والترجمة',
        diseases: 'الأمراض',
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
      models: {
        selectPrompt: 'اختر مجسّماً لتحريره، أو أنشئ مجسّماً جديداً.',
        newModel: 'مجسّم جديد',
        editModel: 'تعديل المجسّم',
        empty: 'لا توجد مجسّمات.',
        createTitle: 'مجسّم جديد',
        editTitle: 'تعديل المجسّم',
        key: 'المفتاح (snake_case)',
        keyHint: 'أحرف صغيرة، مثال heart. لا يمكن تغييره لاحقاً.',
        titleTermKey: 'مفتاح مصطلح العنوان',
        system: 'الجهاز',
        status: 'الحالة',
        versions: 'الإصدارات',
        light: 'خفيف',
        detailed: 'مفصّل',
        url: 'الرابط',
        sizeBytes: 'الحجم (بايت)',
        polyCount: 'عدد الأوجه',
        layers: 'الطبقات',
        meshNames: 'أسماء الشبكات (مفصولة بفواصل)',
        license: 'الترخيص',
        attribution: 'الإسناد',
        sourceUrl: 'رابط المصدر',
        optional: 'اختياري',
        save: 'حفظ',
        saving: 'جارٍ الحفظ…',
        cancel: 'إلغاء',
        error: 'تعذّر الحفظ.',
        statusDraft: 'مسودة',
        statusVerified: 'موثّق',
        publish: 'نشر',
        unpublish: 'إلغاء النشر',
        hotspots: 'النقاط',
        newHotspot: 'نقطة جديدة',
        noHotspots: 'لا توجد نقاط بعد.',
        point: 'نقطة',
        selectHotspot: 'اختر نقطة لعرض تفاصيلها.',
        linkedTerm: 'المصطلح المرتبط',
        layer: 'الطبقة',
        order: 'الترتيب',
        position: 'الموضع',
        camera: 'الكاميرا',
        cameraPosition: 'موضع الكاميرا',
        cameraTarget: 'هدف الكاميرا',
        cameraZoom: 'التقريب',
        meshName: 'اسم الشبكة',
        edit: 'تعديل',
        deleteHotspot: 'حذف النقطة',
        confirmDeleteHotspot: 'هل تريد حذف هذه النقطة؟',
        versionsLicense: 'إصدارات المجسّم والترخيص',
        lightHint: 'يُحمَّل أولاً',
        detailedHint: 'في الخلفية',
        attributionRequired: 'الإسناد مطلوب',
        none: 'غير محدد',
        createHotspotTitle: 'نقطة جديدة',
        editHotspotTitle: 'تعديل النقطة',
        termKeyHint: 'مفتاح مصطلح من قسم المصطلحات، مثال left_ventricle.',
        errorHotspot: 'تعذّر حفظ النقطة.',
      },
      diseases: {
        newDisease: 'مرض جديد',
        search: 'ابحث عن مرض…',
        status: 'الحالة',
        all: 'الكل',
        empty: 'لا توجد أمراض.',
        edit: 'تعديل',
        page: 'صفحة',
        previous: 'السابق',
        next: 'التالي',
        colKey: 'المفتاح',
        colTerm: 'مصطلح المرض',
        colModel: 'المجسّم',
        colStages: 'المراحل',
        colStatus: 'الحالة',
        createTitle: 'مرض جديد',
        editTitle: 'تعديل مرض',
        key: 'المفتاح (snake_case)',
        keyHint: 'أحرف صغيرة، مثال myocardial_infarction. لا يمكن تغييره لاحقاً.',
        termKey: 'مفتاح مصطلح المرض',
        termKeyHint: 'مفتاح مصطلح من فئة «disease»، مثال myocardial_infarction.',
        modelKey: 'مفتاح المجسّم',
        modelKeyHint: 'المجسّم الذي تُعرض عليه المراحل، مثال heart.',
        icd11Code: 'رمز ICD-11',
        icd11Uri: 'رابط ICD-11',
        symptoms: 'الأعراض',
        symptomsHint: 'مفاتيح مصطلحات مفصولة بفواصل (فئة «symptom»).',
        stages: 'المراحل',
        noStages: 'لا توجد مراحل بعد.',
        addStage: 'إضافة مرحلة',
        stageKey: 'مفتاح المرحلة',
        stageLabelTermKey: 'مفتاح مصطلح التسمية',
        highlightMeshes: 'الشبكات المميّزة (مفصولة بفواصل)',
        vesselNarrowing: 'تضيّق الوعاء (0–1)',
        materialOverrides: 'تجاوزات المادة (JSON)',
        materialOverridesHint: 'معاملات مادة Three.js اختيارية بصيغة JSON.',
        removeStage: 'حذف',
        videos: 'الفيديوهات',
        videosHint: 'معرّفات الفيديوهات مفصولة بفواصل.',
        quizId: 'معرّف الاختبار',
        publish: 'نشر',
        unpublish: 'إلغاء النشر',
        optional: 'اختياري',
        save: 'حفظ',
        saving: 'جارٍ الحفظ…',
        cancel: 'إلغاء',
        error: 'تعذّر حفظ المرض.',
        statusDraft: 'مسودة',
        statusNeedsReview: 'قيد المراجعة',
        statusVerified: 'موثّق',
      },
      lessons: {
        newLesson: 'درس جديد',
        search: 'ابحث عن درس…',
        status: 'الحالة',
        all: 'الكل',
        empty: 'لا توجد دروس.',
        edit: 'تعديل',
        page: 'صفحة',
        previous: 'السابق',
        next: 'التالي',
        colKey: 'المفتاح',
        colTitle: 'العنوان',
        colUnit: 'الوحدة',
        colOrder: 'الترتيب',
        colSteps: 'الخطوات',
        colStatus: 'الحالة',
        createTitle: 'درس جديد',
        editTitle: 'تعديل درس',
        key: 'المفتاح (snake_case)',
        keyHint: 'أحرف صغيرة، مثال heart_circulation. لا يمكن تغييره لاحقاً.',
        titleAr: 'العنوان (عربي)',
        titleFr: 'العنوان (فرنسي)',
        titleEn: 'العنوان (إنجليزي)',
        unit: 'الوحدة',
        unitHint: 'تجميع حر، مثال cardiology.',
        order: 'الترتيب',
        orderHint: 'ترتيب الدرس داخل الوحدة.',
        faculty: 'الكلية',
        year: 'السنة',
        yearHint: 'السنة الدراسية، مثال 1.',
        steps: 'الخطوات',
        noSteps: 'لا توجد خطوات بعد.',
        addStep: 'إضافة خطوة',
        removeStep: 'حذف',
        stepType: 'نوع الخطوة',
        stepXp: 'نقاط الخبرة (XP)',
        stepRef: 'مرجع الخطوة',
        refModelKey: 'مفتاح المجسّم',
        refDiseaseKey: 'مفتاح المرض',
        refHotspotIds: 'معرّفات النقاط (مفصولة بفواصل)',
        refVideoId: 'معرّف الفيديو',
        refCaseId: 'معرّف الحالة',
        refQuizId: 'معرّف الاختبار',
        termKeys: 'المصطلحات المفتوحة',
        termKeysHint: 'مفاتيح مصطلحات مفصولة بفواصل، تُفتح عند إتمام الدرس.',
        optional: 'اختياري',
        save: 'حفظ',
        saving: 'جارٍ الحفظ…',
        cancel: 'إلغاء',
        error: 'تعذّر حفظ الدرس.',
        statusDraft: 'مسودة',
        statusNeedsReview: 'قيد المراجعة',
        statusVerified: 'موثّق',
        stepTypes: {
          explain: 'شرح',
          viewer: 'مجسّم',
          video: 'فيديو',
          case: 'حالة سريرية',
          quiz: 'اختبار',
        },
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
    languageShort: { ar: 'ع', fr: 'FR', en: 'EN' },
    tabs: { home: 'Accueil', learn: 'Apprendre', review: 'Révision', profile: 'Profil' },
    term: { speak: 'Écouter la prononciation' },
    viewer: {
      back: 'Retour à l’accueil',
      organTitle: 'القلب',
      organSubtitle: 'Cœur · Heart',
      loading: 'Chargement du modèle…',
      hint: 'Glisser pour tourner · Pincer pour zoomer',
      close: 'Fermer',
      tabs: { anatomy: 'Anatomie', diseases: 'Maladies' },
      icd11: 'ICD-11',
      symptoms: 'Symptômes principaux',
      startQuiz: 'Démarrer un quiz',
      watch: 'Voir la procédure',
      layers: { muscles: 'Muscles', vessels: 'Vaisseaux', skeleton: 'Squelette', nerves: 'Nerfs' },
    },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'Vue d’ensemble',
        organs: 'Organes et modèles',
        terms: 'Termes et traduction',
        diseases: 'Maladies',
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
      models: {
        selectPrompt: 'Choisissez un modèle à modifier, ou créez-en un.',
        newModel: 'Nouveau modèle',
        editModel: 'Modifier le modèle',
        empty: 'Aucun modèle trouvé.',
        createTitle: 'Nouveau modèle',
        editTitle: 'Modifier le modèle',
        key: 'Clé (snake_case)',
        keyHint: 'En minuscules, ex. heart. Non modifiable ensuite.',
        titleTermKey: 'Clé du terme de titre',
        system: 'Système',
        status: 'Statut',
        versions: 'Versions',
        light: 'Léger',
        detailed: 'Détaillé',
        url: 'URL',
        sizeBytes: 'Taille (octets)',
        polyCount: 'Polygones',
        layers: 'Calques',
        meshNames: 'Noms de maillages (séparés par des virgules)',
        license: 'Licence',
        attribution: 'Attribution',
        sourceUrl: 'URL de la source',
        optional: 'facultatif',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        cancel: 'Annuler',
        error: 'Impossible d’enregistrer.',
        statusDraft: 'Brouillon',
        statusVerified: 'Vérifié',
        publish: 'Publier',
        unpublish: 'Dépublier',
        hotspots: 'Points',
        newHotspot: 'Nouveau point',
        noHotspots: 'Aucun point pour l’instant.',
        point: 'Point',
        selectHotspot: 'Sélectionnez un point pour voir ses détails.',
        linkedTerm: 'Terme lié',
        layer: 'Calque',
        order: 'Ordre',
        position: 'Position',
        camera: 'Caméra',
        cameraPosition: 'Position de la caméra',
        cameraTarget: 'Cible de la caméra',
        cameraZoom: 'Zoom',
        meshName: 'Nom du maillage',
        edit: 'Modifier',
        deleteHotspot: 'Supprimer le point',
        confirmDeleteHotspot: 'Supprimer ce point ?',
        versionsLicense: 'Versions du modèle et licence',
        lightHint: 'Chargé en premier',
        detailedHint: 'En arrière-plan',
        attributionRequired: 'Attribution requise',
        none: 'non défini',
        createHotspotTitle: 'Nouveau point',
        editHotspotTitle: 'Modifier le point',
        termKeyHint: 'Une clé de terme, ex. left_ventricle.',
        errorHotspot: 'Impossible d’enregistrer le point.',
      },
      diseases: {
        newDisease: 'Nouvelle maladie',
        search: 'Rechercher une maladie…',
        status: 'Statut',
        all: 'Tous',
        empty: 'Aucune maladie trouvée.',
        edit: 'Modifier',
        page: 'Page',
        previous: 'Précédent',
        next: 'Suivant',
        colKey: 'Clé',
        colTerm: 'Terme de la maladie',
        colModel: 'Modèle',
        colStages: 'Étapes',
        colStatus: 'Statut',
        createTitle: 'Nouvelle maladie',
        editTitle: 'Modifier la maladie',
        key: 'Clé (snake_case)',
        keyHint: 'En minuscules, ex. myocardial_infarction. Non modifiable ensuite.',
        termKey: 'Clé du terme de la maladie',
        termKeyHint: 'Une clé de terme de catégorie « disease », ex. myocardial_infarction.',
        modelKey: 'Clé du modèle',
        modelKeyHint: 'Le modèle sur lequel ces étapes sont affichées, ex. heart.',
        icd11Code: 'Code CIM-11',
        icd11Uri: 'URI CIM-11',
        symptoms: 'Symptômes',
        symptomsHint: 'Clés de termes séparées par des virgules (catégorie « symptom »).',
        stages: 'Étapes',
        noStages: 'Aucune étape pour l’instant.',
        addStage: 'Ajouter une étape',
        stageKey: 'Clé de l’étape',
        stageLabelTermKey: 'Clé du terme de libellé',
        highlightMeshes: 'Maillages en surbrillance (séparés par des virgules)',
        vesselNarrowing: 'Rétrécissement (0–1)',
        materialOverrides: 'Remplacements de matériau (JSON)',
        materialOverridesHint: 'Paramètres de matériau Three.js facultatifs, en JSON.',
        removeStage: 'Supprimer',
        videos: 'Vidéos',
        videosHint: 'Identifiants de vidéos séparés par des virgules.',
        quizId: 'Identifiant du quiz',
        publish: 'Publier',
        unpublish: 'Dépublier',
        optional: 'facultatif',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        cancel: 'Annuler',
        error: 'Impossible d’enregistrer la maladie.',
        statusDraft: 'Brouillon',
        statusNeedsReview: 'À vérifier',
        statusVerified: 'Vérifié',
      },
      lessons: {
        newLesson: 'Nouvelle leçon',
        search: 'Rechercher une leçon…',
        status: 'Statut',
        all: 'Tous',
        empty: 'Aucune leçon trouvée.',
        edit: 'Modifier',
        page: 'Page',
        previous: 'Précédent',
        next: 'Suivant',
        colKey: 'Clé',
        colTitle: 'Titre',
        colUnit: 'Unité',
        colOrder: 'Ordre',
        colSteps: 'Étapes',
        colStatus: 'Statut',
        createTitle: 'Nouvelle leçon',
        editTitle: 'Modifier la leçon',
        key: 'Clé (snake_case)',
        keyHint: 'En minuscules, ex. heart_circulation. Non modifiable ensuite.',
        titleAr: 'Titre (arabe)',
        titleFr: 'Titre (français)',
        titleEn: 'Titre (anglais)',
        unit: 'Unité',
        unitHint: 'Regroupement libre, ex. cardiology.',
        order: 'Ordre',
        orderHint: 'Position de la leçon dans l’unité.',
        faculty: 'Faculté',
        year: 'Année',
        yearHint: 'Année d’études, ex. 1.',
        steps: 'Étapes',
        noSteps: 'Aucune étape pour l’instant.',
        addStep: 'Ajouter une étape',
        removeStep: 'Supprimer',
        stepType: 'Type d’étape',
        stepXp: 'Points d’XP',
        stepRef: 'Référence de l’étape',
        refModelKey: 'Clé du modèle',
        refDiseaseKey: 'Clé de la maladie',
        refHotspotIds: 'Ids des points (séparés par des virgules)',
        refVideoId: 'Id de la vidéo',
        refCaseId: 'Id du cas',
        refQuizId: 'Id du quiz',
        termKeys: 'Termes débloqués',
        termKeysHint: 'Clés de termes séparées par des virgules, débloquées à la fin de la leçon.',
        optional: 'facultatif',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        cancel: 'Annuler',
        error: 'Impossible d’enregistrer la leçon.',
        statusDraft: 'Brouillon',
        statusNeedsReview: 'À vérifier',
        statusVerified: 'Vérifié',
        stepTypes: {
          explain: 'Explication',
          viewer: 'Modèle 3D',
          video: 'Vidéo',
          case: 'Cas clinique',
          quiz: 'Quiz',
        },
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
    languageShort: { ar: 'ع', fr: 'FR', en: 'EN' },
    tabs: { home: 'Home', learn: 'Learn', review: 'Review', profile: 'Profile' },
    term: { speak: 'Listen to pronunciation' },
    viewer: {
      back: 'Back to home',
      organTitle: 'القلب',
      organSubtitle: 'Cœur · Heart',
      loading: 'Loading model…',
      hint: 'Drag to rotate · Pinch to zoom',
      close: 'Close',
      tabs: { anatomy: 'Anatomy', diseases: 'Diseases' },
      icd11: 'ICD-11',
      symptoms: 'Main symptoms',
      startQuiz: 'Start a quiz',
      watch: 'Watch the procedure',
      layers: { muscles: 'Muscles', vessels: 'Vessels', skeleton: 'Skeleton', nerves: 'Nerves' },
    },
    admin: {
      brandLabel: 'Nabd Admin',
      nav: {
        overview: 'Overview',
        organs: 'Organs & models',
        terms: 'Terms & translation',
        diseases: 'Diseases',
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
      models: {
        selectPrompt: 'Select a model to edit, or create a new one.',
        newModel: 'New model',
        editModel: 'Edit model',
        empty: 'No models found.',
        createTitle: 'New model',
        editTitle: 'Edit model',
        key: 'Key (snake_case)',
        keyHint: 'Lowercase, e.g. heart. Cannot be changed later.',
        titleTermKey: 'Title term key',
        system: 'System',
        status: 'Status',
        versions: 'Versions',
        light: 'Light',
        detailed: 'Detailed',
        url: 'URL',
        sizeBytes: 'Size (bytes)',
        polyCount: 'Polygons',
        layers: 'Layers',
        meshNames: 'Mesh names (comma separated)',
        license: 'License',
        attribution: 'Attribution',
        sourceUrl: 'Source URL',
        optional: 'optional',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        error: 'Could not save.',
        statusDraft: 'Draft',
        statusVerified: 'Verified',
        publish: 'Publish',
        unpublish: 'Unpublish',
        hotspots: 'Hotspots',
        newHotspot: 'New hotspot',
        noHotspots: 'No hotspots yet.',
        point: 'Point',
        selectHotspot: 'Select a hotspot to view its details.',
        linkedTerm: 'Linked term',
        layer: 'Layer',
        order: 'Order',
        position: 'Position',
        camera: 'Camera',
        cameraPosition: 'Camera position',
        cameraTarget: 'Camera target',
        cameraZoom: 'Zoom',
        meshName: 'Mesh name',
        edit: 'Edit',
        deleteHotspot: 'Delete hotspot',
        confirmDeleteHotspot: 'Delete this hotspot?',
        versionsLicense: 'Model versions & license',
        lightHint: 'Loaded first',
        detailedHint: 'In background',
        attributionRequired: 'Attribution required',
        none: 'not set',
        createHotspotTitle: 'New hotspot',
        editHotspotTitle: 'Edit hotspot',
        termKeyHint: 'A term key from Terms, e.g. left_ventricle.',
        errorHotspot: 'Could not save the hotspot.',
      },
      diseases: {
        newDisease: 'New disease',
        search: 'Search diseases…',
        status: 'Status',
        all: 'All',
        empty: 'No diseases found.',
        edit: 'Edit',
        page: 'Page',
        previous: 'Previous',
        next: 'Next',
        colKey: 'Key',
        colTerm: 'Disease term',
        colModel: 'Model',
        colStages: 'Stages',
        colStatus: 'Status',
        createTitle: 'New disease',
        editTitle: 'Edit disease',
        key: 'Key (snake_case)',
        keyHint: 'Lowercase, e.g. myocardial_infarction. Cannot be changed later.',
        termKey: 'Disease term key',
        termKeyHint: 'A term key with category "disease", e.g. myocardial_infarction.',
        modelKey: 'Model key',
        modelKeyHint: 'The model these stages are shown on, e.g. heart.',
        icd11Code: 'ICD-11 code',
        icd11Uri: 'ICD-11 URI',
        symptoms: 'Symptoms',
        symptomsHint: 'Term keys separated by commas (category "symptom").',
        stages: 'Stages',
        noStages: 'No stages yet.',
        addStage: 'Add stage',
        stageKey: 'Stage key',
        stageLabelTermKey: 'Label term key',
        highlightMeshes: 'Highlight meshes (comma separated)',
        vesselNarrowing: 'Vessel narrowing (0–1)',
        materialOverrides: 'Material overrides (JSON)',
        materialOverridesHint: 'Optional Three.js material params as JSON.',
        removeStage: 'Remove',
        videos: 'Videos',
        videosHint: 'Video ids separated by commas.',
        quizId: 'Quiz id',
        publish: 'Publish',
        unpublish: 'Unpublish',
        optional: 'optional',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        error: 'Could not save the disease.',
        statusDraft: 'Draft',
        statusNeedsReview: 'Needs review',
        statusVerified: 'Verified',
      },
      lessons: {
        newLesson: 'New lesson',
        search: 'Search lessons…',
        status: 'Status',
        all: 'All',
        empty: 'No lessons found.',
        edit: 'Edit',
        page: 'Page',
        previous: 'Previous',
        next: 'Next',
        colKey: 'Key',
        colTitle: 'Title',
        colUnit: 'Unit',
        colOrder: 'Order',
        colSteps: 'Steps',
        colStatus: 'Status',
        createTitle: 'New lesson',
        editTitle: 'Edit lesson',
        key: 'Key (snake_case)',
        keyHint: 'Lowercase, e.g. heart_circulation. Cannot be changed later.',
        titleAr: 'Title (Arabic)',
        titleFr: 'Title (French)',
        titleEn: 'Title (English)',
        unit: 'Unit',
        unitHint: 'Free grouping, e.g. cardiology.',
        order: 'Order',
        orderHint: 'Position of the lesson inside the unit.',
        faculty: 'Faculty',
        year: 'Year',
        yearHint: 'Study year, e.g. 1.',
        steps: 'Steps',
        noSteps: 'No steps yet.',
        addStep: 'Add step',
        removeStep: 'Remove',
        stepType: 'Step type',
        stepXp: 'XP',
        stepRef: 'Step reference',
        refModelKey: 'Model key',
        refDiseaseKey: 'Disease key',
        refHotspotIds: 'Hotspot ids (comma separated)',
        refVideoId: 'Video id',
        refCaseId: 'Case id',
        refQuizId: 'Quiz id',
        termKeys: 'Unlocked terms',
        termKeysHint: 'Term keys separated by commas, unlocked when the lesson is finished.',
        optional: 'optional',
        save: 'Save',
        saving: 'Saving…',
        cancel: 'Cancel',
        error: 'Could not save the lesson.',
        statusDraft: 'Draft',
        statusNeedsReview: 'Needs review',
        statusVerified: 'Verified',
        stepTypes: {
          explain: 'Explanation',
          viewer: '3D model',
          video: 'Video',
          case: 'Clinical case',
          quiz: 'Quiz',
        },
      },
    },
  },
};
