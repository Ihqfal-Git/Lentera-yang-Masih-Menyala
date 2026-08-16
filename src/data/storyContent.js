/**
 * Lentera yang Masih Menyala — Centralized Story Content Configuration
 * 
 * Anda dapat mengedit semua teks, puisi, surat, kartu kenangan, pilihan, dan kredit
 * langsung di dalam file ini. Perubahan pada teks di file ini akan otomatis langsung
 * mengubah teks yang tampil di antarmuka website.
 */

export const STORY_CONTENT = {
  // Global & General Info
  meta: {
    title: 'Lentera yang Masih Menyala',
    author: 'Muhammad Ihqfal',
    authorCallsign: 'Ihqfal',
    partnerName: 'Annisa Latifah',
    partnerCallsign: 'Latifah',
  },

  // FASE 1: THE BEGINNING (Ruang Hening)
  phase1: {
    meta: 'Ruang Hening',
    title: 'Lentera yang Masih Menyala',
    quote1: 'Ada rasa yang tak selalu mudah terurai oleh kata,',
    quote2: 'Maka biarkan aksara ini menuntun langkahmu menuju apa yang ingin kusampaikan.',
    startButton: 'START',
  },

  // FASE 2: MEMORIES (Mengenangmu)
  phase2: {
    meta: 'Fase 2: Mengenangmu',
    monologueLine1: 'Barangkali, ada kepingan tentangmu yang abadi dalam ingatan,',
    monologueLine2: 'Meski waktu telah membawa langkah kita pada perhentian.',
    
    // 5 Kartu Fokus Utama (Hero Cards Deck)
    memories: [
      {
        id: 1,
        title: 'Senyuman Manismu',
        imageSrc: '/assets/memories/mem-01.jpg',
        caption: 'Entah mengapa, ada sesuatu dalam senyuman manismu yang selalu berhasil menghadirkan rasa nyaman yang sulit kujelaskan.',
        captionSecondary: null,
      },
      {
        id: 2,
        title: 'Saat Ujian Akhir SMK',
        imageSrc: '/assets/memories/mem-02.jpg',
        caption: 'Foto favoritku. Di balik lelahnya masa ujian akhir SMK saat itu, ada perjuangan dan ketulusanmu yang diam-diam selalu kudoakan.',
        captionSecondary: null,
      },
      {
        id: 3,
        title: 'Kacamata Lucumu',
        imageSrc: '/assets/memories/mem-03.jpg',
        caption: 'Kacamata lucumu dan caramu melihat dunia selalu punya tempat tersendiri yang tak pernah pudar dalam ingatanku.',
        captionSecondary: null,
      },
      {
        id: 4,
        title: 'Lagi Bikin Bunga Pake Pita',
        imageSrc: '/assets/memories/mem-04.jpg',
        caption: 'Melihat jemarimu telaten merangkai pita menjadi bunga, aku selalu kagum pada caramu menciptakan keindahan dari hal-hal sederhana.',
        captionSecondary: null,
      },
      {
        id: 5,
        title: 'Foto Terakhir Sebelum Break',
        imageSrc: '/assets/memories/mem-05.jpg',
        caption: 'Potret terakhir sebelum langkah kita mengambil jeda. Kupikir waktu akan meredakan segalanya, nyatanya bayangmu justru kian benderang saat jarak membentang.',
        captionSecondary: null,
      },
    ],

    // Monolog Transisi setelah 5 kartu fokus selesai
    transitionMonologueLine1: 'Dan sebenarnya... tidak hanya lima kepingan itu.',
    transitionMonologueLine2: 'Masih ada begitu banyak jejak kecil tentangmu yang tersimpan rapi...',

    // Dinding Mozaik Seluruh 12 Foto Kenangan
    mosaic: {
      title: 'Galeri Fragmen Ingatan',
      prompt: 'Sentuh foto untuk melihat kembali kepingan kenangan',
      ctaButton: 'Lanjutkan Perjalanan',
      photos: [
        {
          id: 1,
          title: 'Senyuman Manismu',
          imageSrc: '/assets/memories/mem-01.jpg',
          caption: 'Entah mengapa, ada sesuatu dalam senyuman manismu yang selalu berhasil menghadirkan rasa nyaman yang sulit kujelaskan.',
        },
        {
          id: 2,
          title: 'Saat Ujian Akhir SMK',
          imageSrc: '/assets/memories/mem-02.jpg',
          caption: 'Foto favoritku. Di balik lelahnya masa ujian akhir SMK saat itu, ada perjuangan dan ketulusanmu yang diam-diam selalu kudoakan.',
        },
        {
          id: 3,
          title: 'Kacamata Lucumu',
          imageSrc: '/assets/memories/mem-03.jpg',
          caption: 'Kacamata lucumu dan caramu melihat dunia selalu punya tempat tersendiri yang tak pernah pudar dalam ingatanku.',
        },
        {
          id: 4,
          title: 'Lagi Bikin Bunga Pake Pita',
          imageSrc: '/assets/memories/mem-04.jpg',
          caption: 'Melihat jemarimu telaten merangkai pita menjadi bunga, aku selalu kagum pada caramu menciptakan keindahan dari hal-hal sederhana.',
        },
        {
          id: 5,
          title: 'Foto Terakhir Sebelum Break',
          imageSrc: '/assets/memories/mem-05.jpg',
          caption: 'Potret terakhir sebelum langkah kita mengambil jeda. Kupikir waktu akan meredakan segalanya, nyatanya bayangmu justru kian benderang saat jarak membentang.',
        },
        {
          id: 6,
          title: 'Tatapanmu',
          imageSrc: '/assets/memories/mem-06.jpg',
          caption: 'Ada kejujuran yang dalam di balik tatapanmu, sesuatu yang selalu membuatku merasa tenang.',
        },
        {
          id: 7,
          title: 'Ekspresi Mata Sayu',
          imageSrc: '/assets/memories/mem-07.jpg',
          caption: 'Bahkan di saat matamu sayu menahan lelah, kamu tetap sosok yang paling ingin kujaga.',
        },
        {
          id: 8,
          title: 'Imut dan Lucu',
          imageSrc: '/assets/memories/mem-08.jpg',
          caption: 'Tingkah dan ekspresimu yang lucu selalu punya cara ajaib untuk menghapus rasa sepi.',
        },
        {
          id: 9,
          title: 'Warna Outfit Favorit',
          imageSrc: '/assets/memories/mem-09.jpg',
          caption: 'Warna outfit yang selalu pas dengan kepribadianmu yang cerah dan apa adanya.',
        },
        {
          id: 10,
          title: 'Pamer Rambut Dicat',
          imageSrc: '/assets/memories/mem-10.jpg',
          caption: 'Caramu dengan bangga memamerkan warna rambut barumu hari itu, selalu membuatku tersenyum mengingatnya.',
        },
        {
          id: 11,
          title: 'Filter Favoritmu',
          imageSrc: '/assets/memories/mem-11.jpg',
          caption: 'Filter sederhana yang sering kamu pakai, selalu berhasil menangkap sisi manismu yang alami.',
        },
        {
          id: 12,
          title: 'Acara Perpisahan SMK',
          imageSrc: '/assets/memories/mem-12.jpg',
          caption: 'Hari perpisahan SMK itu, kamu tampil begitu anggun dan berbeda dari hari-hari biasa.',
        },
      ],
    },

    interactivePrompt: 'Namun ingatan tak hanya hadir saat kita mencari,',
    flowerAriaLabel: 'Sentuh bunga kenangan',
    closingText: 'Yang mekar di kala sunyi kembali menghampiri, dan dari dalamnya lahir sesuatu yang tak pernah benar-benar pergi.',
  },

  // FASE 3: THE JOURNEY (Mengikuti Jejak yang Tertinggal)
  phase3: {
    meta: 'Fase 3: Perjalanan',
    // Momen 1: Kunang-Kunang (Pendar Ingatan)
    moment1PoetryLine1: 'Ada seberkas cahaya yang tak pernah benar-benar padam di tengah kesunyian malam.',
    moment1PoetryLine2: 'Menjaga nyala kenangan agar tak larut dalam pekat yang kelam.',
    // Momen 2: Bunga Malam (Mekar dalam Hening)
    moment2PoetryLine1: 'Ada rasa yang tumbuh perlahan dalam hening.',
    moment2PoetryLine2: 'Menanti waktu yang tepat untuk kembali menemukan arah.',
    // Momen 3: Rasi Bintang (Titik yang Terhubung)
    moment3PoetryLine1: 'Ketika titik-titik yang terpisah perlahan saling terpaut,',
    moment3PoetryLine2: 'Kita mulai mengerti ke mana sesungguhnya arah langkah bertaut.',
    // Amplop di akhir Fase 3
    envelopePrompt: 'Sebuah surat yang menunggu untuk dibaca',
    envelopeAriaLabel: 'Buka amplop surat percakapan',
  },

  // FASE 4: THE CONVERSATION (Hal-Hal yang Sulit Diucapkan)
  phase4: {
    meta: 'Fase 4: Percakapan',
    // Monolog pembuka sebelum membuka amplop
    monologueLine1: 'Malam kian larut, dan aksara yang lama tersimpan akhirnya menemukan muara.',
    monologueLine2: 'Tak ada kemarahan di sini, hanya kejujuran yang ingin menemukan suara.',
    monologueLine3: 'Jika kamu berkenan, biarkan surat ini menyampaikan apa yang tak sempat terucap.',

    // Surat utama
    letter: {
      envelopeAriaLabel: 'Ketuk untuk membuka surat percakapan',
      greeting: 'Untukmu, Latifah,',
      paragraphs: [
        'Ada beberapa hal yang rupanya lebih sulit disampaikan daripada yang pernah kubayangkan.',
        'Bukan karena aku tidak memiliki kata-kata, melainkan karena terlalu banyak yang ingin kusampaikan, sementara kita justru semakin sering kehilangan makna di antara kata-kata itu.',
        'Belakangan ini, aku banyak berpikir tentang kita. Tentang percakapan yang dahulu terasa sederhana, kemudian perlahan menjadi sesuatu yang harus kita pikirkan berkali-kali sebelum mengucapkan satu kalimat. Tentang bagaimana dua orang yang pernah begitu dekat dapat berada dalam satu ruang, tetapi terasa begitu jauh di dalamnya.',
        'Aku tidak menulis ini untuk mencari siapa yang benar. Aku juga tidak ingin menjadikan surat ini sebagai tempat untuk menghitung siapa yang paling banyak terluka, siapa yang paling banyak berusaha, atau siapa yang seharusnya meminta maaf lebih dahulu.',
        'Mungkin ada bagian yang salah dariku. Mungkin ada bagian yang salah darimu. Dan mungkin ada begitu banyak hal yang sebenarnya tidak pernah benar-benar salah, hanya tidak pernah sempat kita bicarakan dengan cara yang semestinya.',
        'Aku hanya tahu satu hal. Aku masih ingin memahami. Bukan hanya ingin dipahami.',
        'Aku ingin mendengar apa yang selama ini mungkin terlalu sulit untuk kamu ucapkan. Aku ingin tahu apa yang kamu rasakan ketika percakapan kita mulai kehilangan arah. Apa yang membuatmu lelah. Apa yang membuatmu memilih diam. Dan apa yang sebenarnya masih ingin kamu katakan, jika suatu hari nanti kita memiliki keberanian untuk duduk dan berbicara tanpa saling mempertahankan diri.',
        'Aku pun memiliki banyak hal yang ingin kuceritakan. Tentang apa yang kurasakan. Tentang hal-hal yang selama ini gagal kusampaikan dengan baik. Tentang bagaimana aku memandang hubungan ini setelah semua jeda yang kita lalui.',
        'Namun kali ini aku tidak ingin memaksakan semua jawabannya hadir sekaligus. Karena mungkin beberapa hal memang membutuhkan waktu. Dan mungkin, untuk sementara, yang kita perlukan bukanlah sebuah keputusan. Melainkan sebuah ruang untuk saling mendengar.',
        'Jika masih ada satu percakapan yang bersedia kita buka kembali, aku ingin memulainya tanpa membawa siapa pun sebagai pemenang dan siapa pun sebagai pihak yang kalah. Hanya kita. Dua orang yang pernah memilih untuk berjalan bersama, dan kini sedang mencoba memahami ke mana langkah ini seharusnya dibawa.',
        'Aku tidak tahu apa yang akan menunggu kita di ujung percakapan itu. Tetapi setidaknya kali ini, aku ingin kita sampai di sana dengan kata-kata yang jujur. Bukan dengan diam. Bukan dengan asumsi. Bukan dengan hal-hal yang tidak pernah sempat kita katakan.',
        'Terima kasih sudah sampai sejauh ini. Jika suatu saat nanti kamu bersedia, aku masih ingin mendengar kata-kata yang tersimpan di dalam hatimu.<br><br>Apa pun yang kamu pilih, biarlah itu menjadi keputusan yang benar-benar datang darimu, sebagai langkah yang ingin kamu jalani.',
      ],
      signature: '— Ihqfal',
    },

    // Refleksi penutup setelah membaca surat (menuju Fase 5)
    reflectionLine1: 'Aku tak berharap jawaban yang lahir dari keresahan.',
    reflectionLine2: 'Aku hanya ingin pilihanmu lahir dari apa yang benar-benar kamu rasakan.',
  },

  // FASE 5: THE CHOICE & ENDINGS (Keputusan Berada di Tanganmu)
  phase5: {
    meta: 'Fase 5: Jawaban & Pilihan',
    // Monolog pembuka Fase 5 (Fokus ke arah keputusan pembaca)
    openingThought1: 'Tidak semua jawaban harus terburu-buru kamu temukan.',
    openingThought2: 'Kini saatnya, biarkan hatimu yang menentukan arah tujuan.',
    promptQuestion: 'Ke mana hatimu ingin melangkah setelah ini?',

    // Tiga Pilihan, Dialog Konfirmasi & Template Lirik Lagu
    choices: {
      reconcile: {
        id: 'reconcile',
        title: 'Bicara Kembali',
        description: 'Membuka ruang untuk saling mendengar dan bertutur kata.',
        confirmBadge: 'Bicara Kembali',
        confirmQuestion: 'Apakah kamu yakin dengan pilihan ini?',
        confirmExplanation: 'Langkah ini berarti kamu memilih untuk membuka kembali ruang percakapan, bersedia mendengar dan berbagi rasa tanpa ada yang merasa diadili.',
        vibeTitle: 'Cahaya Fajar & Percakapan Baru',
        songTrackName: "Maliq & D'Essentials — Senja Teduh Pelita",
        // LRC Synced Lyrics untuk Ending 1
        lrcLyrics: `[00:32.87] Kita duduk di taman
[00:35.84] Bunganya bermekaran
[00:38.56] Saling sapa beri pujian
[00:43.75] Kita menatap awan
[00:46.54] Mendekat meneduhkan
[00:49.40] Memayungi hati yang senang
[00:54.66] Kita menunjuk bintang
[00:57.51] Mereka pun berjatuhan
[01:00.57] Menyambut merayakan
[01:04.93] Dunia di kala senja teduh pelita
[01:12.48] Bertemu dalam ruang rindunya
[01:18.11] Langit biru jadi jingga
[01:21.34] Bawa pesan untuk kita
[01:25.32] Silakan bersatu
[01:32.11] Dunia merestu
[01:38.36] Kita di bawah hujan
[01:40.86] Langit tetap benderang
[01:44.05] Pelangi pun datang menjelang
[01:49.11] Kita merayu malam
[01:52.17] Jangan sedih tenggelam
[01:54.92] Bulan sabit beri senyuman
[02:00.09] Kita meminta waktu
[02:03.03] Satu hari berhenti
[02:05.92] Satu masa dia memberi
[02:10.57] Dunia di kala senja teduh pelita
[02:18.09] Bertemu dalam ruang rindunya
[02:23.70] Langit biru jadi jingga
[02:26.71] Bawa pesan untuk kita
[02:30.82] Silakan bersatu
[02:33.52] Dunia membawa restunya, restunya
[02:38.90] Inilah waktu untuk bilang cinta
[02:44.39] Bolehkan aku bilang cinta
[02:47.16] Bolehkan aku bilang cinta
[02:50.06] Bolehkan aku bilang
[02:55.54] Kuingin bersatu
[03:07.31] Kaulah pelita
[03:09.77] Kala merindu
[03:12.61] Dunia di kala senja teduh pelita
[03:26.32] Bertemu dalam ruang rindunya
[03:31.54] Langit biru jadi jingga
[03:35.04] Bawa pesan untuk kita
[03:39.91] Kaulah dunia
[03:43.75] Kala merindu
[03:45.68] Kaulah pelita
[03:48.33] Kaulah dunia
[03:53.36] Kala merindu
[03:55.45] Kaulah pelita
[04:04.49] Senja teduh pelita
[04:08.02] Senja teduh pelita
[04:10.76] Senja teduh pelita`,
        songLyrics: [
          {
            line1: 'Di antara hening yang sempat kita jaga...',
            line2: 'Kini ada kata yang ingin pulang menyapa.',
            duration: 3800,
          },
          {
            line1: 'Bukan untuk mencari siapa yang menang atau kalah...',
            line2: 'Hanya dua hati yang bersedia kembali melangkah.',
            duration: 4200,
          },
          {
            line1: 'Jika masih ada jalan yang bisa kita lalui bersama,',
            line2: 'Mari kita mulai kembali dari satu percakapan yang jujur.',
            duration: 4400,
          },
        ],
        endingNarratives: [
          {
            line1: 'Jika masih ada ruang di hatimu untuk kembali bertutur kata,',
            line2: 'Aku bersedia menyambut langkahmu dengan hati terbuka.',
          },
          {
            line1: 'Barangkali masih ada cerita yang belum selesai kita bicarakan,',
            line2: 'Jika kamu bersedia, mari kita kembali saling mengusahakan.',
          },
        ],
      },
      wait: {
        id: 'wait',
        title: 'Beri Waktu',
        description: 'Mengambil jeda dan ruang untuk menata rasa.',
        confirmBadge: 'Beri Waktu',
        confirmQuestion: 'Apakah kamu yakin dengan pilihan ini?',
        confirmExplanation: 'Langkah ini berarti kamu memilih untuk memberi waktu bagi diri sendiri, tanpa terburu-buru hingga hatimu benar-benar menemukan ketenangan.',
        vibeTitle: 'Temaram Rembulan & Ruang Hening',
        songTrackName: 'Nadin Amizah — Bunga Tidur',
        // LRC Synced Lyrics untuk Ending 2
        lrcLyrics: `[00:12.21] Bunga tidur apa kabarmu pagi ini sayang?
[00:26.25] Kau terbangun di antara nyaringnya rambu perpisahan
[00:40.05] Siapa yang telah membuatmu penuh malu
[00:54.53] Terpatri dalam kau tak baik 'tuk diusahakan
[01:08.48] Jangan pergi dulu
[01:15.64] Biar waktu berlalu
[01:22.59] Dan semua sakitmu yang kau bawa akan runtuh
[01:38.62] Bunga tidur engkau penuh takut
[01:47.54] Lama percaya kau penghancur seisi dunia
[02:01.88] Apapun yang engkau dekap terbakar dan mengabu
[02:15.65] Siapa yang telah membuatmu penuh malu
[02:29.63] Terpatri dalam kau tak baik 'tuk diusahakan
[02:43.53] Jangan pergi dulu
[02:50.18] Biar waktu berlalu
[02:57.85] Dan semua sakitmu
[03:03.65] Yang kau bawa akan runtuh
[03:11.87] Bunga tidur engkau penuh takut
[03:19.02] Aku juga masih penuh takut
[03:26.31] Aku tahu engkau penuh takut`,
        songLyrics: [
          {
            line1: 'Biarkan waktu merapikan yang terserak...',
            line2: 'Di sudut ruang hening tanpa perlu terdesak.',
            duration: 3800,
          },
          {
            line1: 'Jika semesta mengizinkan kita bersua lagi,',
            line2: 'Semoga jeda ini mengajarkan kita arti saling memahami.',
            duration: 4200,
          },
          {
            line1: 'Tenangkan hatimu, tak perlu ada yang dipaksakan sekarang.',
            line2: 'Ada kehangatan yang menunggu di waktu yang tepat.',
            duration: 4400,
          },
        ],
        endingNarratives: [
          {
            line1: 'Tak semua teka-teki harus terjawab di keheningan malam ini,',
            line2: 'Biarlah jeda menjadi pelukan hingga hatimu kembali berani.',
          },
          {
            line1: 'Biarlah keheningan ini merawat setiap luka yang tersisa,',
            line2: 'Hingga tiba saatnya hatimu kembali percaya pada rasa.',
          },
        ],
      },
      farewell: {
        id: 'farewell',
        title: 'Lepaskan',
        description: 'Menerima akhir perjalanan dengan penuh keikhlasan.',
        confirmBadge: 'Lepaskan',
        confirmQuestion: 'Apakah kamu yakin dengan pilihan ini?',
        confirmExplanation: 'Langkah ini berarti kamu memilih untuk merelakan akhir dari perjalanan ini, melangkah pergi dengan damai dan rasa terima kasih atas setiap kenangan yang pernah ada.',
        vibeTitle: 'Senja Tenang & Keikhlasan',
        songTrackName: 'Lovarian — Perpisahan Termanis',
        // LRC Synced Lyrics untuk Ending 3
        lrcLyrics: `[00:15.16] Bila nanti kita berpisah
[00:18.61] Jangan kau lupakan
[00:22.09] Kenangan yang indah
[00:24.76] Kisah kita
[00:29.18] Jika memang kau tak tercipta
[00:32.47] Untuk kumiliki
[00:36.02] Cobalah mengerti
[00:38.43] Yang terjadi
[00:42.97] Bila mungkin memang tak bisa
[00:49.96] Jangan pernah coba memaksa
[00:54.84] 'Tuk tetap bertahan
[00:58.06] Di tengah kepedihan
[01:03.81] Jadikan ini perpisahan yang termanis
[01:10.36] Yang indah dalam hidupmu
[01:14.08] Sepanjang waktu
[01:17.66] Semua berakhir tanpa dendam dalam hati
[01:24.25] Maafkan semua salahku
[01:27.93] Yang mungkin menyakitimu
[01:33.24] Semoga kelak kau 'kan temukan
[01:36.80] Kekasih sejati
[01:40.28] Yang 'kan menyayangi
[01:43.04] Lebih dariku
[01:47.29] Bila mungkin memang tak bisa
[01:54.23] Menyatukan perbedaaan kita
[01:59.38] Dan tetap bertahan
[02:02.41] Di tengah kepedihan
[02:08.16] Jadikan ini perpisahan yang termanis
[02:14.65] Yang indah dalam hidupmu
[02:18.26] Sepanjang waktu
[02:22.32] Semua berakhir tanpa dendam dalam hati
[02:28.75] Maafkan semua salahku
[02:32.33] Yang mungkin menyakitimu
[02:55.22] Bila mungkin memang tak bisa
[03:01.84] Menyatukan perbedaaan kita
[03:07.10] Dan tetap bertahan
[03:10.40] Di tengah kepedihan
[03:16.01] Ho-oh-oh
[03:19.42] Jadikan ini perpisahan yang termanis
[03:25.93] Yang indah dalam hidupmu
[03:29.79] Sepanjang waktu
[03:33.28] Semua berakhir tanpa dendam dalam hati
[03:40.17] Maafkan semua salahku
[03:43.45] Yang mungkin menyakitimu
[03:47.40] Jadikan ini perpisahan yang termanis
[03:53.93] Yang indah dalam hidupmu
[03:57.54] Sepanjang waktu
[04:01.16] Semua berakhir tanpa dendam dalam hati
[04:08.09] Maafkan semua salahku
[04:11.58] Yang mungkin menyakitimu`,
        songLyrics: [
          {
            line1: 'Terima kasih untuk setiap tawa yang pernah singgah...',
            line2: 'Meski perjalanan ini harus selesai di tengah langkah.',
            duration: 3800,
          },
          {
            line1: 'Kulepaskan genggaman dengan ikhlas yang utuh...',
            line2: 'Semoga bahagiamu tetap tumbuh, di mana pun kamu berlabuh.',
            duration: 4200,
          },
          {
            line1: 'Tidak ada luka yang sia-sia di antara aksara ini,',
            line2: 'Selamat melanjutkan langkahmu dengan penuh damai.',
            duration: 4400,
          },
        ],
        endingNarratives: [
          {
            line1: 'Jika kisah ini memang harus sampai pada batas akhir perjalanan,',
            line2: 'Kuingin mengingatmu sebagai jejak terindah dalam kenangan.',
          },
          {
            line1: 'Terima kasih pernah menjadi bagian terindah dalam kisah ini,',
            line2: 'Kulepaskan genggaman dengan ikhlas, semoga bahagiamu tetap bersemi.',
          },
        ],
      },
    },

    // Tombol Konfirmasi Modal
    btnConfirm: 'Ya, lanjutkan',
    btnCancel: 'Kembali',

    // Layar Penutup & Kredit
    credits: {
      title: 'Lentera yang Masih Menyala',
      subtitle: 'Selesai',
      line1: 'Terima kasih telah melangkah bersama di antara kata dan jeda,',
      line2: 'Setiap perjalanan memiliki maknanya tersendiri yang berharga,',
      line3: 'Dan di balik setiap aksara, semoga damai senantiasa ada.',
      viewLyricsButton: 'Dengarkan Lirik Lagi',
      replayButton: 'Mulai Dari Awal',

      // Integrasi Tombol WhatsApp Pribadi
      whatsapp: {
        enabled: true,
        phoneNumber: '6283808378293', // Masukkan nomor WhatsApp Anda (format internasional: diawali 62 tanpa tanda + atau spasi)
        buttonLabel: 'Nyatakan Pilihanmu',
        draftMessages: {
          reconcile: 'Aku sudah membaca tulisanmu sampai selesai. Rasanya lega sekaligus hangat menyadari kita tidak harus terus saling diam 🥹 Jika lentera itu masih menyala, aku memilih untuk bicara kembali. Mari kita duduk bersama lagi, saling mendengar tanpa perlu ada yang merasa bersalah 🙂🤍',
          wait: 'Jujur, butuh waktu bagiku untuk menyerap semua kata-katamu. Terima kasih sudah begitu terbuka 😌 Untuk saat ini, aku memilih untuk memberi waktu bagi kita berdua. Biarkan hati kita sama-sama tenang lebih dahulu, agar saat kita bertemu nanti, tidak ada lagi luka yang tersisa 🫂🤍',
          farewell: 'Membaca lembar terakhirmu membuatku tersenyum dengan mata berkaca-kaca 🥲 Terima kasih untuk setiap jejak tulus yang pernah kita bagi. Aku memilih untuk melepaskan semuanya dengan damai dan ikhlas. Berbahagialah dengan jalan barumu, aku melangkah pergi dengan rasa terima kasih yang teramat dalam 🤍',
        },
      },
    },
  },
};

export default STORY_CONTENT;
