export type Lang = "zh" | "en" | "ar";

export const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "ar", label: "العربية" }
];

export const I18N: Record<Lang, Record<string, string>> = {
  en: {
    appName: "Real World",
    tagline: "A real, irreversible world.",
    login: "Login",
    signup: "Sign up",
    logout: "Logout",
    email: "Email",
    password: "Password",
    verifyHint: "Please verify your email to continue.",
    write: "Write",
    timeline: "Timeline",
    minChars: "Min 12 chars",
    slideToSeal: "Slide to seal (irreversible)",
    preview: "Preview",
    worldRule: "World rule: login required · irreversible · identity bound"
  },

  zh: {
    appName: "现实世界",
    tagline: "一个真实、不可撤回的世界。",
    login: "登录",
    signup: "注册",
    logout: "退出",
    email: "邮箱",
    password: "密码",
    verifyHint: "请先完成邮箱验证。",
    write: "记录",
    timeline: "时间线",
    minChars: "至少 12 个字",
    slideToSeal: "滑动封印（不可撤回）",
    preview: "预览",
    worldRule: "世界规则：需登录 · 不可撤回 · 身份绑定"
  },

  ar: {
    appName: "العالم الحقيقي",
    tagline: "عالم حقيقي لا يمكن التراجع عنه.",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    verifyHint: "يرجى تأكيد بريدك الإلكتروني أولاً.",
    write: "اكتب",
    timeline: "الخط الزمني",
    minChars: "12 حرفًا على الأقل",
    slideToSeal: "اسحب للتأكيد (غير قابل للتراجع)",
    preview: "معاينة",
    worldRule: "قواعد العالم: تسجيل دخول · غير قابل للتراجع · هوية مرتبطة"
  }
};
