"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  return (
   <div className={styles.root}>
      <div className={styles.nav}>
        <span className={styles.text} onClick={() => router.push("/Qr")}>QR Connect</span>
        <span className={styles.logo}></span>
        <span className={styles.text} onClick={() => router.push("/")}>Marketing analytics</span>
      </div>
      <div className={styles.roller}>
         <div className={styles.marqueeContainer1}>
           <p className={styles.marqueeText}>"Hear the maker, hold the craft — <i style={{fontWeight: '400',backgroundColor: '#FF6600',color: '#ffffff',padding: '2px',borderRadius: '5px'}}>connecting centuries </i>of skill to modern buyers across the globe. From hands that shape heritage to voices that travel the world — discover the story behind every handcrafted piece"</p>
           <p className={styles.marqueeText}>"Hear the maker, hold the craft — <i style={{fontWeight: '400',backgroundColor: '#FF6600',color: '#ffffff',padding: '2px',borderRadius: '5px'}}>connecting centuries </i>of skill to modern buyers across the globe. From hands that shape heritage to voices that travel the world — discover the story behind every handcrafted piece"</p>
         </div>
      </div>
      <div className={styles.content}>
        <div className={styles.contentLeft}>
          <h1 className={styles.heading}>Discover the</h1>
          <h1 className={styles.heading}>Soul Behind</h1>
          <h1 className={styles.heading}>The Craft <span className={styles.heartEmoji}>❤️</span></h1>
          <p className={styles.subText}>From hands that shape heritage to voices that travel the world — discover the story behind every <span className={styles.highlightText}>handcrafted</span> piece</p>
        </div>
        <div className={styles.contentRight}>
          <img src="/main.jpg" alt="Traditional craftsperson" className={styles.mainImage} />
        </div>
      </div>
      <div className={styles.roller}>
         <div className={styles.marqueeContainer2}>
           <p className={styles.marqueeText}>"Hear the maker, hold the craft — <i style={{fontWeight: '400',backgroundColor: '#FF6600',color: '#ffffff',padding: '2px',borderRadius: '5px'}}>connecting centuries </i>of skill to modern buyers across the globe. From hands that shape heritage to voices that travel the world — discover the story behind every handcrafted piece"</p>
           <p className={styles.marqueeText}>"Hear the maker, hold the craft — <i style={{fontWeight: '400',backgroundColor: '#FF6600',color: '#ffffff',padding: '2px',borderRadius: '5px'}}>connecting centuries </i>of skill to modern buyers across the globe. From hands that shape heritage to voices that travel the world — discover the story behind every handcrafted piece"</p>
         </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.hearStoriesLeft}>
            <h2 className={styles.hearStoriesTitle}>Hear</h2>
            <h2 className={styles.hearStoriesTitle}>Stories...</h2>
          </div>
          <div className={styles.imageMarqueeContainer}>
            <div className={styles.imageMarquee}>
              <div className={styles.storyCard}>
                <img src="/pexels-sabinakallari-33960001.jpg" alt="Craft story 1" className={styles.storyImage} />
              </div>
              <div className={styles.storyCard}>
                <img src="/pexels-maadhuri-g-627519-2933639.jpg" alt="Craft story 2" className={styles.storyImage} />
              </div>
              <div className={styles.storyCard}>
                <img src="/pexels-ali-ramazan-ciftci-82252581-13317688.jpg" alt="Craft story 3" className={styles.storyImage} />
              </div>
              <div className={styles.storyCard}>
                <img src="/main.jpg" alt="Craft story 4" className={styles.storyImage} />
              </div>
              <div className={styles.storyCard}>
                <img src="/pexels-sabinakallari-33960001.jpg" alt="Craft story 1" className={styles.storyImage} />
              </div>
              <div className={styles.storyCard}>
                <img src="/pexels-maadhuri-g-627519-2933639.jpg" alt="Craft story 2" className={styles.storyImage} />
              </div>
            </div>
          </div>
        </div>
      </div>
   </div>
  );
}
