import Dictionary from '@/components/Dictionary';

export const metadata = { title: 'القاموس الإسباني العربي', description: 'أكثر الكلمات الإسبانية استعمالا، مع الترجمة العربية ومثال ونطق صحيح.', alternates: { canonical: '/dictionary' } };

export default function DictionaryPage() {
  return (<>
    <div className="hd"><div><h1>القاموس 📕</h1><p>أكثر الكلمات الإسبانية استعمالا، مع الترجمة ومثال ونطق. ابحث بالإسبانية أو بالعربية.</p></div></div>
    <Dictionary />
  </>);
}
