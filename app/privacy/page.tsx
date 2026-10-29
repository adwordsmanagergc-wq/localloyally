import '../landing.css';
import type { Metadata } from 'next';
import LegalShell from '@/components/LegalShell';
import { company } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy policy | Loyal Locally' };

const UPDATED = '29 October 2026';

/** Privacy notice under Indonesia's Personal Data Protection Law (UU PDP No. 27/2022, Art. 21). Plain language; review with a local adviser. */
export default function Privacy() {
  const co = company();
  return (
    <LegalShell title="Privacy policy" titleId="Kebijakan privasi" updated={UPDATED}>
      <section id="en">
        <h2>1. Who is responsible for your data</h2>
        <p>Each rewards card belongs to the business you signed up with (for example, a cafe). That business decides how your card data is used and is the data controller. {co.name} runs the Loyal Locally app and processes the data on the business&apos;s behalf. For enquiries from businesses (the &quot;free week&quot; form), {co.name} is the controller.</p>

        <h2>2. What we collect</h2>
        <ul>
          <li><strong>Account:</strong> username, WhatsApp number and password (stored scrambled, never readable).</li>
          <li><strong>Optional:</strong> birthday day and month (no year), if you give it for a birthday treat.</li>
          <li><strong>Card activity:</strong> stamps, visits, rewards, vouchers, spins, gift certificates, referrals, social post links you send, and which staff member served you.</li>
          <li><strong>Device:</strong> your IP address (to stop abuse such as password guessing), and if you turn them on, the codes your phone or wallet app needs for notifications and wallet card updates.</li>
          <li><strong>Business enquiries:</strong> business name and type, your name, WhatsApp number, email, city and message.</li>
        </ul>
        <p>We don&apos;t collect your location, contacts or photos, and we don&apos;t use advertising or analytics trackers.</p>

        <h2>3. Why we use it, and on what basis</h2>
        <ul>
          <li>To run your card: log you in, add stamps, give rewards, reset your password by WhatsApp code. This is needed to provide the service you signed up for.</li>
          <li>To send reminders, offers and review requests on WhatsApp, only if you ticked the box. This is based on your consent, which you can withdraw at any time on your card.</li>
          <li>To prevent fraud and keep the service secure (for example, limiting login attempts and logging who gave each stamp).</li>
          <li>To reply to business enquiries.</li>
        </ul>
        <p>We don&apos;t sell your data or use it for anything else.</p>

        <h2>4. Who sees it</h2>
        <ul>
          <li>The business and its staff, to run your card. Managers can export the members list.</li>
          <li>Service providers who help us run the app: our database and hosting providers (Supabase, Vercel), the WhatsApp sender (Meta WhatsApp Business or Fonnte), email (Resend), and Apple or Google if you add your card to their wallet. They may only use the data to provide their service to us.</li>
          <li>Authorities, if the law requires it.</li>
        </ul>

        <h2>5. Data stored outside Indonesia</h2>
        <p>Our database and hosting providers may store data on servers outside Indonesia (for example, Singapore). We only use providers with strong security and data protection, as required by Article 56 of UU PDP.</p>

        <h2>6. How long we keep it</h2>
        <p>We keep your card data while your card is open. If you delete your card, your details, stamps and rewards there are deleted straight away. Login codes expire within minutes and are deleted daily and abuse-prevention records (such as IP addresses) within 2 days. Business enquiries are kept for up to 2 years. Gift certificates bought for someone else stay valid for them, without your details.</p>

        <h2>7. Your rights</h2>
        <p>You can:</p>
        <ul>
          <li>see the data we hold about you, and get a copy;</li>
          <li>correct it if it is wrong;</li>
          <li>delete your card and details at any time (&quot;Delete my card and details&quot; at the bottom of your card), or ask the business or us to do it;</li>
          <li>stop WhatsApp marketing at any time (untick the box on your card), and withdraw any other consent;</li>
          <li>object to how your data is used, or complain to the Indonesian data protection authority.</li>
        </ul>
        <p>Email us at {co.email} or ask the business. We reply within 3 x 24 hours, as UU PDP requires.</p>

        <h2>8. Security and data breaches</h2>
        <p>Passwords are scrambled, connections are encrypted, and staff logins and code attempts are limited. If a data breach affects you, we will tell you and the authorities within 3 x 24 hours of finding out, with what happened and what we are doing about it.</p>

        <h2>9. Children</h2>
        <p>Cards are for people aged 18 or over. Younger people may only sign up with a parent&apos;s or guardian&apos;s permission. If you think a child signed up without permission, contact us and we will delete the card.</p>

        <h2>10. Cookies</h2>
        <p>We only use cookies that keep you logged in. There are no advertising or tracking cookies, so we don&apos;t ask you to accept any.</p>

        <h2>11. Changes</h2>
        <p>If we change this policy in an important way, we will tell you on your card before it applies.</p>
      </section>

      <section id="id" style={{ marginTop: 40 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)' }}>Kebijakan privasi (Bahasa Indonesia)</h1>

        <h2>1. Siapa yang bertanggung jawab atas data Anda</h2>
        <p>Setiap kartu hadiah dimiliki oleh usaha tempat Anda mendaftar (misalnya kafe). Usaha tersebut menentukan penggunaan data kartu Anda dan merupakan pengendali data pribadi. {co.name} menjalankan aplikasi Loyal Locally dan memproses data atas nama usaha tersebut. Untuk pertanyaan dari usaha (formulir &quot;free week&quot;), {co.name} adalah pengendali data.</p>

        <h2>2. Data yang kami kumpulkan</h2>
        <ul>
          <li><strong>Akun:</strong> nama pengguna, nomor WhatsApp dan kata sandi (disimpan dalam bentuk acak, tidak dapat dibaca).</li>
          <li><strong>Opsional:</strong> tanggal dan bulan ulang tahun (tanpa tahun), jika Anda memberikannya untuk hadiah ulang tahun.</li>
          <li><strong>Aktivitas kartu:</strong> stempel, kunjungan, hadiah, voucher, putaran, sertifikat hadiah, referensi, tautan postingan media sosial yang Anda kirim, dan staf yang melayani Anda.</li>
          <li><strong>Perangkat:</strong> alamat IP Anda (untuk mencegah penyalahgunaan seperti menebak kata sandi), dan jika Anda mengaktifkannya, kode yang dibutuhkan ponsel atau aplikasi dompet digital untuk notifikasi dan pembaruan kartu.</li>
          <li><strong>Pertanyaan usaha:</strong> nama dan jenis usaha, nama Anda, nomor WhatsApp, email, kota dan pesan.</li>
        </ul>
        <p>Kami tidak mengumpulkan lokasi, kontak atau foto Anda, dan tidak menggunakan pelacak iklan atau analitik.</p>

        <h2>3. Tujuan dan dasar pemrosesan</h2>
        <ul>
          <li>Untuk menjalankan kartu Anda: masuk, menambah stempel, memberi hadiah, mengatur ulang kata sandi dengan kode WhatsApp. Ini diperlukan untuk memberikan layanan yang Anda daftarkan.</li>
          <li>Untuk mengirim pengingat, penawaran dan permintaan ulasan melalui WhatsApp, hanya jika Anda mencentang kotaknya. Ini berdasarkan persetujuan Anda, yang dapat Anda tarik kapan saja di kartu Anda.</li>
          <li>Untuk mencegah kecurangan dan menjaga keamanan layanan (misalnya membatasi percobaan masuk dan mencatat siapa yang memberi setiap stempel).</li>
          <li>Untuk membalas pertanyaan dari usaha.</li>
        </ul>
        <p>Kami tidak menjual data Anda atau menggunakannya untuk hal lain.</p>

        <h2>4. Siapa yang dapat melihatnya</h2>
        <ul>
          <li>Usaha tersebut dan stafnya, untuk menjalankan kartu Anda. Manajer dapat mengunduh daftar anggota.</li>
          <li>Penyedia layanan yang membantu kami menjalankan aplikasi: penyedia basis data dan hosting (Supabase, Vercel), pengirim WhatsApp (Meta WhatsApp Business atau Fonnte), email (Resend), serta Apple atau Google jika Anda menambahkan kartu ke dompet digital mereka. Mereka hanya boleh menggunakan data untuk memberikan layanan kepada kami.</li>
          <li>Pihak berwenang, jika diwajibkan oleh hukum.</li>
        </ul>

        <h2>5. Data yang disimpan di luar Indonesia</h2>
        <p>Penyedia basis data dan hosting kami dapat menyimpan data di server di luar Indonesia (misalnya Singapura). Kami hanya menggunakan penyedia dengan keamanan dan perlindungan data yang kuat, sesuai Pasal 56 UU PDP.</p>

        <h2>6. Berapa lama kami menyimpannya</h2>
        <p>Kami menyimpan data kartu Anda selama kartu Anda aktif. Jika Anda menghapus kartu, data, stempel dan hadiah Anda di sana langsung dihapus. Kode masuk kedaluwarsa dalam beberapa menit dan dihapus setiap hari dan catatan pencegahan penyalahgunaan (seperti alamat IP) dalam 2 hari. Pertanyaan dari usaha disimpan paling lama 2 tahun. Sertifikat hadiah yang dibeli untuk orang lain tetap berlaku bagi mereka, tanpa data Anda.</p>

        <h2>7. Hak Anda</h2>
        <p>Anda dapat:</p>
        <ul>
          <li>melihat data yang kami simpan tentang Anda, dan mendapatkan salinannya;</li>
          <li>memperbaikinya jika salah;</li>
          <li>menghapus kartu dan data Anda kapan saja (&quot;Delete my card and details&quot; di bagian bawah kartu Anda), atau meminta usaha tersebut atau kami untuk melakukannya;</li>
          <li>berhenti menerima pesan pemasaran WhatsApp kapan saja (hapus centang di kartu Anda), dan menarik persetujuan lainnya;</li>
          <li>menolak cara data Anda digunakan, atau mengadu kepada lembaga pelindungan data pribadi Indonesia.</li>
        </ul>
        <p>Kirim email ke {co.email} atau hubungi usaha tersebut. Kami membalas dalam 3 x 24 jam, sesuai UU PDP.</p>

        <h2>8. Keamanan dan kebocoran data</h2>
        <p>Kata sandi diacak, koneksi dienkripsi, dan percobaan masuk staf serta kode dibatasi. Jika terjadi kebocoran data yang memengaruhi Anda, kami akan memberi tahu Anda dan pihak berwenang dalam 3 x 24 jam sejak mengetahuinya, termasuk apa yang terjadi dan apa yang kami lakukan.</p>

        <h2>9. Anak-anak</h2>
        <p>Kartu ini untuk orang berusia 18 tahun ke atas. Orang yang lebih muda hanya boleh mendaftar dengan izin orang tua atau wali. Jika Anda yakin seorang anak mendaftar tanpa izin, hubungi kami dan kami akan menghapus kartunya.</p>

        <h2>10. Cookie</h2>
        <p>Kami hanya menggunakan cookie agar Anda tetap masuk. Tidak ada cookie iklan atau pelacakan, sehingga kami tidak meminta persetujuan untuk itu.</p>

        <h2>11. Perubahan</h2>
        <p>Jika kami mengubah kebijakan ini secara penting, kami akan memberi tahu Anda di kartu Anda sebelum berlaku.</p>
        <p>Jika terdapat perbedaan antara versi bahasa Inggris dan Bahasa Indonesia, versi Bahasa Indonesia yang berlaku.</p>
      </section>
    </LegalShell>
  );
}
