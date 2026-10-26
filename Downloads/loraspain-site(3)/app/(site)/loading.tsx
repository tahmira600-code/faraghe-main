// يظهر فورا عند الضغط على أي رابط، حتى تصل الصفحة
export default function Loading() {
  return (
    <div className="skel" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="toploader" />
      <i style={{ height: 110 }} />
      <i style={{ height: 64 }} />
      <i style={{ height: 320 }} />
    </div>
  );
}
