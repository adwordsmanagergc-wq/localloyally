import '../landing.css';
import type { Metadata } from 'next';
import LegalShell from '@/components/LegalShell';

export const metadata: Metadata = { title: 'Terms and conditions | Loyal Locally' };

const UPDATED = '29 October 2026';

/** Terms customers agree to when they sign up for a rewards card. Plain language, in English and Bahasa Indonesia; review with a local adviser. */
export default function Terms() {
  return (
    <LegalShell title="Terms and conditions" titleId="Syarat dan ketentuan" updated={UPDATED}>
      <section id="en">
        <p className="lp-terms-meta">For rewards cards.</p>

        <h2>1. Who runs your card</h2>
        <p>Each rewards card belongs to the business you signed up with (for example, a cafe). That business sets its own rewards, prizes and rules and is responsible for honouring them. Loyal Locally provides the app the business uses.</p>

        <h2>2. Your account</h2>
        <ul>
          <li>You need to be 18 or older, or have a parent&apos;s or guardian&apos;s permission.</li>
          <li>You need a username, a password and a WhatsApp number you can receive messages on.</li>
          <li>Keep your password private. If you think someone else has used your card, tell the business so it can fix it. You aren&apos;t responsible for misuse that wasn&apos;t your fault.</li>
          <li>One card per person per business. The details you give must be your own and correct.</li>
        </ul>

        <h2>3. Stamps and rewards</h2>
        <ul>
          <li>Staff add stamps when you buy something and show your card. Stamps have no cash value and can&apos;t be sold, swapped or transferred.</li>
          <li>When you have enough stamps, you can claim the reward shown on your card. Claiming it uses those stamps.</li>
          <li>Vouchers and prizes (including from spin to win, offers and birthday treats) are valid until the date shown and can&apos;t be exchanged for cash.</li>
          <li>If the business changes or ends its rewards or rules, it will show this on your card at least 14 days before. Changes don&apos;t take away stamps, rewards or vouchers you have already earned: you can still use them under the old rules until the date shown.</li>
        </ul>

        <h2>4. Fair use</h2>
        <p>The business can remove stamps or rewards that were gained by mistake or unfairly (for example, sharing someone else&apos;s card, fake social posts or misusing a screenshot), and can close a card that is misused. It should tell you why.</p>

        <h2>5. Spin to win</h2>
        <p>Spins are free and are given as a thank-you. You never pay to play. Prizes are discounts or free items at that business only, and the chances are set by the business.</p>

        <h2>6. Gift certificates</h2>
        <p>Gift certificates can be used until the date shown, in one go or over several visits. They can&apos;t be exchanged for cash unless the law requires it. Treat the link like cash: anyone with it can use the balance.</p>

        <h2>7. Messages</h2>
        <p>We send WhatsApp messages needed to run your card, such as password reset codes. Reminders, offers and review requests are only sent if you ticked the box to receive them, and you can stop them at any time on your card.</p>

        <h2>8. Your data</h2>
        <p>How we collect, use and protect your data is explained in our <a href="/privacy" style={{ textDecoration: 'underline' }}>privacy policy</a>. We don&apos;t sell your data. You can delete your card and details at any time with &quot;Delete my card and details&quot; on your card, or by asking the business or us.</p>

        <h2>9. Changes, language and law</h2>
        <p>We may update these terms. If the changes are important, we&apos;ll tell you on your card before they apply. For questions about your stamps or rewards, ask the business. These terms are governed by the laws of the Republic of Indonesia and don&apos;t limit your rights under Indonesian consumer protection law.</p>
      </section>

      <section id="id" style={{ marginTop: 40 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.1rem)' }}>Syarat dan ketentuan (Bahasa Indonesia)</h1>
        <p className="lp-terms-meta">Untuk kartu hadiah.</p>

        <h2>1. Siapa yang menjalankan kartu Anda</h2>
        <p>Setiap kartu hadiah dimiliki oleh usaha tempat Anda mendaftar (misalnya kafe). Usaha tersebut menetapkan hadiah, undian dan aturannya sendiri serta bertanggung jawab untuk memenuhinya. Loyal Locally menyediakan aplikasi yang digunakan usaha tersebut.</p>

        <h2>2. Akun Anda</h2>
        <ul>
          <li>Anda harus berusia 18 tahun ke atas, atau mendapat izin orang tua atau wali.</li>
          <li>Anda memerlukan nama pengguna, kata sandi dan nomor WhatsApp yang dapat menerima pesan.</li>
          <li>Jaga kerahasiaan kata sandi Anda. Jika Anda menduga orang lain menggunakan kartu Anda, beri tahu usaha tersebut agar dapat diperbaiki. Anda tidak bertanggung jawab atas penyalahgunaan yang bukan kesalahan Anda.</li>
          <li>Satu kartu per orang per usaha. Data yang Anda berikan harus milik Anda sendiri dan benar.</li>
        </ul>

        <h2>3. Stempel dan hadiah</h2>
        <ul>
          <li>Staf menambahkan stempel saat Anda membeli sesuatu dan menunjukkan kartu Anda. Stempel tidak memiliki nilai tunai dan tidak dapat dijual, ditukar atau dipindahkan.</li>
          <li>Jika stempel Anda cukup, Anda dapat mengklaim hadiah yang tertera di kartu. Klaim hadiah menggunakan stempel tersebut.</li>
          <li>Voucher dan hadiah (termasuk dari putar roda, penawaran dan hadiah ulang tahun) berlaku sampai tanggal yang tertera dan tidak dapat ditukar dengan uang tunai.</li>
          <li>Jika usaha mengubah atau mengakhiri hadiah atau aturannya, hal ini akan ditampilkan di kartu Anda paling lambat 14 hari sebelumnya. Perubahan tidak menghapus stempel, hadiah atau voucher yang sudah Anda peroleh: Anda tetap dapat menggunakannya dengan aturan lama sampai tanggal yang tertera.</li>
        </ul>

        <h2>4. Penggunaan yang wajar</h2>
        <p>Usaha dapat menghapus stempel atau hadiah yang diperoleh karena kesalahan atau secara tidak wajar (misalnya memakai kartu orang lain, postingan media sosial palsu atau menyalahgunakan tangkapan layar), dan dapat menutup kartu yang disalahgunakan. Usaha sebaiknya memberi tahu Anda alasannya.</p>

        <h2>5. Putar roda (spin to win)</h2>
        <p>Putaran diberikan gratis sebagai ucapan terima kasih. Anda tidak pernah membayar untuk bermain. Hadiahnya berupa diskon atau barang gratis hanya di usaha tersebut, dan peluangnya ditentukan oleh usaha.</p>

        <h2>6. Sertifikat hadiah</h2>
        <p>Sertifikat hadiah dapat digunakan sampai tanggal yang tertera, sekaligus atau dalam beberapa kunjungan. Sertifikat tidak dapat ditukar dengan uang tunai kecuali diwajibkan oleh hukum. Perlakukan tautannya seperti uang tunai: siapa pun yang memilikinya dapat menggunakan saldonya.</p>

        <h2>7. Pesan</h2>
        <p>Kami mengirim pesan WhatsApp yang diperlukan untuk menjalankan kartu Anda, seperti kode atur ulang kata sandi. Pengingat, penawaran dan permintaan ulasan hanya dikirim jika Anda mencentang kotak untuk menerimanya, dan Anda dapat menghentikannya kapan saja di kartu Anda.</p>

        <h2>8. Data Anda</h2>
        <p>Cara kami mengumpulkan, menggunakan dan melindungi data Anda dijelaskan dalam <a href="/privacy#id" style={{ textDecoration: 'underline' }}>kebijakan privasi</a> kami. Kami tidak menjual data Anda. Anda dapat menghapus kartu dan data Anda kapan saja melalui &quot;Delete my card and details&quot; di kartu Anda, atau dengan meminta kepada usaha tersebut atau kami.</p>

        <h2>9. Perubahan, bahasa dan hukum</h2>
        <p>Kami dapat memperbarui syarat ini. Jika perubahannya penting, kami akan memberi tahu Anda di kartu Anda sebelum berlaku. Untuk pertanyaan tentang stempel atau hadiah, hubungi usaha tersebut. Syarat ini diatur oleh hukum Republik Indonesia dan tidak membatasi hak Anda berdasarkan hukum perlindungan konsumen Indonesia. Jika terdapat perbedaan antara versi bahasa Inggris dan Bahasa Indonesia, versi Bahasa Indonesia yang berlaku.</p>
      </section>
    </LegalShell>
  );
}
