# دليل LoraSpain: من الصفر إلى موقع يعمل

هذا الدليل يشرح لك كل خطوة بالترتيب. اتبع الخطوات من 1 إلى 8 مرة واحدة فقط، وبعدها تدير كل شيء من لوحة التحكم.

**قاعدة مهمة:** المفاتيح السرية (Supabase service_role، Google API key) لا تُرسل في المحادثات، ولا تُكتب داخل الكود. توضع فقط في Vercel، أو في ملف `.env.local` على حاسوبك، أو في لوحة التحكم (مفتاح الصوت).

---

## ما تحتاجه

| الحساب أو البرنامج | لماذا | السعر |
|---|---|---|
| GitHub | يحفظ كود الموقع | مجاني |
| Supabase | قاعدة البيانات، وتسجيل الدخول، وملفات الصوت | مجاني في البداية |
| Vercel | ينشر الموقع على الإنترنت | مجاني في البداية |
| Google Cloud | الدخول بـ Gmail، وتوليد الصوت | مجاني ضمن الحصة الشهرية |
| Google Search Console | يعرّفك بما يبحث عنه الناس في Google ليصلوا إليك | مجاني |
| VS Code و Node.js و Git | لتشغيل الموقع وتعديله على حاسوبك | مجانية |

---

## 1. VS Code على حاسوبك (اختياري، لكن مفيد)

1. حمّل وثبّت هذه البرامج الثلاثة:
   - **VS Code** من code.visualstudio.com
   - **Node.js** (نسخة LTS) من nodejs.org
   - **Git** من git-scm.com
2. فك ضغط الملف `loraspain-site.zip`، ستجد مجلدا اسمه `site`. سمّه `loraspain` إذا أردت.
3. في VS Code: **File > Open Folder** واختر المجلد.
4. افتح الطرفية: **Terminal > New Terminal**، واكتب:
   ```bash
   npm install
   ```
5. انسخ الملف `.env.example` وسمّ النسخة `.env.local`. ستملأ القيم فيه في الخطوات القادمة.
6. لتشغيل الموقع على حاسوبك:
   ```bash
   npm run dev
   ```
   ثم افتح http://localhost:3000 في المتصفح.

> بدون مفاتيح Supabase، يعمل الموقع بالمحتوى الجاهز، لكن بدون تسجيل دخول.

---

## 2. GitHub (حفظ الكود)

1. ادخل إلى github.com، ثم اضغط **+** في الأعلى ثم **New repository**.
2. الاسم: `loraspain`، واختر **Private** (خاص)، ثم **Create repository**.
3. أسهل طريقة لرفع الكود من VS Code:
   - اضغط على أيقونة **Source Control** في الشريط الجانبي (رمز الفروع).
   - اضغط **Initialize Repository**، ثم اكتب رسالة مثل `first version` واضغط **Commit**.
   - اضغط **Publish Branch**، واختر حسابك في GitHub، ثم المستودع `loraspain`.
4. بعد ذلك، كل تعديل: **Commit** ثم **Sync Changes**، وVercel ينشره تلقائيا.

> طريقة بدون VS Code: في صفحة المستودع اضغط **uploading an existing file**، واسحب كل ملفات المجلد (ما عدا `node_modules` و`.env.local`).

---

## 3. Supabase (قاعدة البيانات وتسجيل الدخول)

1. في supabase.com، داخل حسابك، اضغط **New project**:
   - الاسم: `loraspain`
   - كلمة سر لقاعدة البيانات: احفظها عندك
   - المنطقة: **West EU** أو **Central EU** (قريبة من إسبانيا)
2. انتظر حتى يجهز المشروع، ثم افتح **SQL Editor** من القائمة اليسرى، ثم **New query**.
3. افتح الملف `supabase/schema.sql` من المشروع، وانسخ كل محتواه، والصقه، ثم اضغط **Run**. يجب أن ترى `Success`.
4. افتح **Project Settings > API** (أو **API Keys**)، وانسخ:
   - `Project URL` إلى `NEXT_PUBLIC_SUPABASE_URL`
   - المفتاح `anon` / `publishable` إلى `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - المفتاح `service_role` / `secret` إلى `SUPABASE_SERVICE_ROLE_KEY` (سري جدا)
5. افتح **Authentication > URL Configuration**:
   - **Site URL**: عنوان موقعك (في البداية عنوان Vercel، مثل `https://loraspain.vercel.app`)
   - **Redirect URLs**: أضف `https://loraspain.vercel.app/auth/callback` و`http://localhost:3000/auth/callback`
6. افتح **Authentication > Providers > Google**. ستحتاج Client ID وClient Secret من الخطوة 4، فاترك هذه الصفحة مفتوحة.

---

## 4. Google Cloud (الدخول بـ Gmail + الصوت)

### أ. الدخول بـ Gmail
1. افتح console.cloud.google.com بنفس حسابك، واختر **New Project** باسم `loraspain`.
2. **APIs & Services > OAuth consent screen**: اختر **External**، واكتب اسم الموقع وبريدك، ثم احفظ.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - النوع: **Web application**
   - **Authorized redirect URIs**: الصق الرابط الذي تجده في صفحة Google داخل Supabase (يشبه `https://xxxx.supabase.co/auth/v1/callback`).
4. انسخ **Client ID** و**Client Secret**، والصقهما في Supabase (الخطوة 3.6)، وفعّل Google، ثم **Save**.

### ب. الصوت (Text-to-Speech)
1. **APIs & Services > Library**، ابحث عن **Cloud Text-to-Speech API**، ثم **Enable**. قد يطلب منك إضافة بطاقة بنكية للفوترة، لكن الاستعمال العادي يبقى داخل الحصة المجانية الشهرية.
2. **Credentials > Create credentials > API key**، ثم اضغط **Restrict key** واختر **Cloud Text-to-Speech API** فقط.
3. انسخ المفتاح (يبدأ بـ `AIza`). **لا تضعه في الكود**: ستلصقه لاحقا في لوحة التحكم (الخطوة 7).

---

## 5. Vercel (النشر على الإنترنت)

1. ادخل إلى vercel.com بحساب GitHub، ثم **Add New > Project**، واختر المستودع `loraspain`، ثم **Import**.
2. افتح **Environment Variables**، وأضف كل هذه المتغيرات (الأسماء كما هي تماما):

   | الاسم | القيمة |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | عنوان الموقع، مثل `https://loraspain.vercel.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | من Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | من Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | من Supabase (سري) |
   | `ADMIN_EMAILS` | `tahmira600@gmail.com` |
   | `GOOGLE_SITE_VERIFICATION` | رمز التحقق من Google Search Console (الخطوة 6) |

3. اضغط **Deploy**، وانتظر حتى يظهر الرابط.
4. **اسم نطاق خاص** (اختياري): **Settings > Domains**، واكتب نطاقك واتبع التعليمات. بعدها غيّر العنوان في:
   - `NEXT_PUBLIC_SITE_URL` في Vercel
   - **Site URL** و**Redirect URLs** في Supabase
   - Google Search Console (أضف النطاق الجديد كموقع جديد)
5. أي تغيير في متغيرات Vercel يحتاج **Redeploy** من صفحة **Deployments**.

---

## 6. Google Search Console (ماذا يبحث الناس ليصلوا إليك)

1. افتح search.google.com/search-console بحسابك، واضغط **Add property**.
2. اختر **URL prefix** (بادئة عنوان URL)، واكتب `https://loraspain.vercel.app`، ثم **Continue**.
3. في طرق التحقق اختر **HTML tag**. ستجد سطرا يشبه:
   `<meta name="google-site-verification" content="AbC123..." />`
   انسخ فقط ما بين علامتي التنصيص بعد `content=` (مثلا `AbC123...`).
4. في Vercel: **Settings > Environment Variables**، أضف `GOOGLE_SITE_VERIFICATION` والصق الرمز، ثم **Redeploy**.
5. ارجع إلى Search Console واضغط **Verify**.
6. من القائمة اختر **Sitemaps**، واكتب `sitemap.xml` ثم **Submit**. الخريطة تتحدث وحدها كلما أضفت موضوعا أو درسا.
7. بعد يومين إلى أسبوع تظهر البيانات في **Performance**: الكلمات التي بحث بها الناس، وكم مرة ظهر موقعك، وكم شخصا ضغط عليه.

> Search Console يعرض فقط من جاء من بحث Google. لمعرفة كل الزوار (من واتساب وفيسبوك وغيرها) تحتاج أداة إحصاء مثل Vercel Analytics.

---

## 7. أول تشغيل للوحة التحكم

1. افتح موقعك، واضغط **الدخول بحساب Google**، وادخل بـ `tahmira600@gmail.com`.
2. ستظهر في القائمة **⚙️ لوحة التحكم** (أو افتح `/admin`).
3. اضغط **استيراد المحتوى الأولي**: تنتقل كل البطاقات والأسئلة والمواضيع والمهن إلى قاعدة البيانات.
4. افتح **الإعدادات والصوت**، والصق مفتاح Google (الخطوة 4-ب)، ثم **حفظ الإعدادات**.
5. اضغط **توليد الصوت للبطاقات الناقصة**. كل ضغطة تعالج 25 بطاقة، فاضغط حتى يصير العدد صفرا.

---

## 8. استعمال لوحة التحكم

| ماذا تريد | أين |
|---|---|
| إضافة كلمة أو جملة | **البطاقات**: اختر الموضوع، واملأ النموذج، ثم **حفظ ونشر** |
| تسجيل صوتك لبطاقة | **البطاقات > تعديل > 🎙️ سجّل بصوتك**، ثم اسمع، ثم **حفظ التعديل** |
| رفع ملف صوت جاهز | نفس المكان، خانة الملف (mp3) |
| توليد صوت Google لبطاقة واحدة | زر **توليد** في عمود الصوت |
| إضافة لغة ترجمة (الدارجة، الفرنسية…) | **لغات الترجمة > إضافة لغة** (الدارجة رمزها `ary`)، فتظهر لها خانة في كل بطاقة وسؤال |
| موضوع أو مهنة جديدة | **المواضيع والمهن > إضافة**، والنوع «مهنة» يظهر في «اختر عملك» |
| تغيير ما هو مفتوح للجميع وما يحتاج حسابا | **المواضيع والمهن > تعديل** |
| أسئلة رخصة السياقة والجنسية | **الأسئلة**: الاختيارات كل واحد في سطر، ورقم الجواب الصحيح يبدأ من 1 |
| بلاغات الزوار عن الأخطاء | **البلاغات**: **تعديل** يفتح البطاقة، و**تم الإصلاح** يغلق البلاغ |
| إيقاف الصوت في الموقع كله | **الإعدادات والصوت > تشغيل الصوت** |
| نص الصفحة الرئيسية | **الإعدادات والصوت** |
| من سجّل وماذا تعلّم | **المستخدمون** |

### كيف يعمل القفل
- **مجاني:** يراه كل زائر.
- **بحساب Google:** يفتح بعد التسجيل، بدون دفع.
- الموقع مجاني بالكامل: لا يوجد دفع، وكل المستويات مفتوحة. الزائر بدون حساب يرى أول بطاقتين وسؤالا واحدا من المواضيع التي تحتاج حسابا.
- صاحب لوحة التحكم يرى كل شيء مفتوحا.

---

## مشاكل شائعة

| المشكلة | الحل |
|---|---|
| زر Google لا يعمل | تأكد من Redirect URLs في Supabase، ومن redirect URI في Google Cloud |
| لا تظهر لوحة التحكم | تأكد أن `ADMIN_EMAILS` في Vercel هو نفس بريدك، ثم Redeploy |
| Search Console يقول «لم يتم التحقق» | تأكد من `GOOGLE_SITE_VERIFICATION` في Vercel (الرمز فقط بدون `<meta`)، ثم Redeploy |
| «توليد الصوت» يعطي خطأ | تأكد أن Text-to-Speech API مفعّل، وأن الفوترة مفعّلة في Google Cloud |
| التسجيل من الميكروفون لا يعمل | اسمح للموقع باستعمال الميكروفون من إعدادات المتصفح (يحتاج https) |

---

## تحديث الموقع إلى النسخة 3 (المحتوى الجديد، الأيقونات، التقدم، Pro)

1. **جدول التقدم:** في Supabase افتح SQL Editor، والصق محتوى الملف `supabase/progress.sql`، ثم اضغط Run. (مرة واحدة فقط)
2. **ارفع الكود:** في VS Code اكتب في الطرفية:
   ```
   git add .
   git commit -m "v3: content, icons, progress, pro"
   git push
   ```
3. **انتظر فيرسيل** حتى يصبح النشر Ready.
4. **المحتوى الجديد:** ادخل إلى لوحة التحكم واضغط «استيراد المحتوى الأولي». يضيف فقط البطاقات والأسئلة والمواضيع الجديدة، ولا يغيّر ما عدّلته أنت.
5. **الموقع مجاني:** لم يعد هناك Pro ولا باقات مدفوعة. كل المستويات مفتوحة، ورخصة السياقة والجنسية تُفتح بحساب Google مجانا.
6. **الأيقونات** موجودة داخل الموقع في `public/emoji` (Fluent Emoji 3D من Microsoft، رخصة MIT). إذا أضفت بطاقة بإيموجي جديد لا توجد صورته، يظهر الإيموجي العادي.
