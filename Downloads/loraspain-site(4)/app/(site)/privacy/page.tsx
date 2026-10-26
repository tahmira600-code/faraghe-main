export const metadata = { title: 'سياسة الخصوصية', alternates: { canonical: '/privacy' } };

export default function Privacy() {
  return (<>
    <div className="hd"><div><h1>سياسة الخصوصية</h1><p>Política de privacidad</p></div></div>
    <div className="lock" style={{ textAlign: 'start', lineHeight: 1.9 }}>
      <p>عند الدخول بحساب Google نحفظ فقط بريدك الإلكتروني واسمك، لنفتح لك الدروس ونحفظ تقدمك.</p>
      <p>الموقع مجاني بالكامل، ولا نطلب أي دفع ولا أي بيانات بنكية.</p>
      <p>إذا أرسلت بلاغا عن مشكلة في جملة، نحفظ نص البلاغ لنصلح المحتوى.</p>
      <p>لا نبيع بياناتك ولا نشاركها مع أي جهة أخرى. لحذف حسابك وبياناتك راسلنا على tahmira600@gmail.com.</p>
      <p>Al iniciar sesión con Google guardamos solo tu correo y nombre. El sitio es totalmente gratuito y no pedimos ningún pago. No vendemos ni compartimos tus datos. Para borrar tu cuenta escribe a tahmira600@gmail.com.</p>
    </div>
  </>);
}
