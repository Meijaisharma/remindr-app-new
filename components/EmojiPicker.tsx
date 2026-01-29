import React, { useState } from 'react';
import { Search, Clock, Smile, Coffee, Activity, Globe, Flag, Heart } from 'lucide-react';

const EMOJI_CATEGORIES = {
  recent: ['😂','❤️','👍','🔥','🥰','🙏','😊','🎉','🤔','😅','😭','👀','🙌','✨','💯','😁','😎','👋','💀','✅','🥹','🫶','🫡','🫣','🫠','🫧','🦄','🌈','🍕','🍻'],
  smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  people: ['👋','🤚','✨','🙌','🫶','🤲','🤝','👍','👎','👊','✊','🤛','🤜','🤞','✌️','🫰','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','💪','🦾','🖕','✍️','🙏','🫵','🦶','🦵','🦿','💄','💋','👄','🦷','👅','👂','🦻','👃','👣','👁️','👀','🧠','🫀','🫁','🦴','👤','👥','🫂','👶','👧','🧒','👦','👩','🧑','👨','👩‍🦱','🧑‍🦱','👨‍🦱','👩‍🦰','🧑‍🦰','👨‍🦰','👱‍♀️','👱','👱‍♂️','👩‍🦳','🧑‍🦳','👨‍🦳','👩‍🦲','🧑‍🦲','👨‍🦲','🧔‍♀️','🧔','🧔‍♂️','👵','🧓','👴','👲','👳‍♀️','👳','👳‍♂️','🧕'],
  nature: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','cow','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🦈','🐟','🐠','🐳','🐋','🐬','🦭','🐾','🌵','🎄','🌲','🌳','🌴','🌱','🌿','☘️','🍀','🎍','🎋','🍃','🍂','🍁','🍄','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⭐','🌟','✨','⚡','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','💧','💦','☔','☂️','🌊'],
  food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','burrito','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','☕','🫖','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
  objects: ['⌚','📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📠','📺','📻','🎙️','🎚️','🎛️','⏱️','⏲️','⏰','🕰️','⏳','⌛','📡','🔋','🔌','💡','🔦','🕯️','🗑️','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🧰','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  gif: [
    { id: '1', bg: 'linear-gradient(45deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', text: 'OMG' },
    { id: '2', bg: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', text: 'LOL' },
    { id: '3', bg: 'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)', text: 'WOW' },
    { id: '4', bg: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', text: 'YAY' },
    { id: '5', bg: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', text: 'SAD', color: 'white' },
    { id: '6', bg: 'linear-gradient(to top, #ff0844 0%, #ffb199 100%)', text: 'LOVE', color: 'white' },
    { id: '7', bg: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', text: 'BYE' },
    { id: '8', bg: 'linear-gradient(to top, #fccb90 0%, #d57eeb 100%)', text: 'HI' },
    { id: '9', bg: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', text: 'COOL' },
    { id: '10', bg: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', text: 'YES' },
  ]
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>('emoji');
  const [activeCategory, setActiveCategory] = useState('recent');

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`emoji-cat-${id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const CategoryIcon = ({ cat, icon: Icon }: any) => (
    <button 
      onClick={() => scrollToCategory(cat)}
      className={`p-2 rounded-full transition-all active:scale-95 ${activeCategory === cat ? 'bg-white/80 shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  return (
    <div className="h-[300px] w-full flex flex-col bg-white/40 backdrop-blur-xl">
        
        {/* GIF / Emoji Toggle Bar */}
        <div className="h-10 flex items-center justify-center gap-1 bg-white/50 p-1 mx-4 mt-3 rounded-xl border border-white/40 shadow-inner">
             <button 
               onClick={() => setActiveTab('emoji')}
               className={`flex-1 rounded-lg text-xs font-bold py-1.5 transition-all ${activeTab === 'emoji' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Emoji
             </button>
             <button 
               onClick={() => setActiveTab('gif')}
               className={`flex-1 rounded-lg text-xs font-bold py-1.5 transition-all ${activeTab === 'gif' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
             >
               GIF
             </button>
        </div>

        {activeTab === 'emoji' ? (
          <>
             {/* Content Area */}
             <div className="flex-1 overflow-y-auto p-2 no-scrollbar scroll-smooth relative">
                
                <CategorySection id="recent" title="Frequently Used" emojis={EMOJI_CATEGORIES.recent} onSelect={onSelect} />
                <CategorySection id="smileys" title="Smileys & Emotion" emojis={EMOJI_CATEGORIES.smileys} onSelect={onSelect} />
                <CategorySection id="people" title="People & Body" emojis={EMOJI_CATEGORIES.people} onSelect={onSelect} />
                <CategorySection id="nature" title="Animals & Nature" emojis={EMOJI_CATEGORIES.nature} onSelect={onSelect} />
                <CategorySection id="food" title="Food & Drink" emojis={EMOJI_CATEGORIES.food} onSelect={onSelect} />
                <CategorySection id="objects" title="Objects" emojis={EMOJI_CATEGORIES.objects} onSelect={onSelect} />

             </div>

             {/* Bottom Category Tab Bar (WhatsApp Style) */}
             <div className="h-12 border-t border-white/30 flex items-center justify-between px-4 bg-white/30 backdrop-blur-lg">
                 <CategoryIcon cat="recent" icon={Clock} />
                 <CategoryIcon cat="smileys" icon={Smile} />
                 <CategoryIcon cat="people" icon={Heart} />
                 <CategoryIcon cat="nature" icon={Coffee} />
                 <CategoryIcon cat="objects" icon={Globe} />
             </div>
          </>
        ) : (
          <div className="flex-1 p-3 overflow-y-auto no-scrollbar">
             {/* Fake GIF Search */}
             <div className="relative mb-3 group">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
                 <input type="text" placeholder="Search GIPHY" className="w-full bg-white/60 border border-white/50 rounded-xl pl-9 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-gray-500 text-gray-800" />
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                 {EMOJI_CATEGORIES.gif.map(g => (
                     <button 
                        key={g.id} 
                        onClick={() => onSelect('[GIF]')}
                        className="aspect-video rounded-xl flex items-center justify-center font-black text-2xl tracking-tighter shadow-sm hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group" 
                        style={{background: g.bg, color: g.color || 'black'}}
                     >
                         <span className="relative z-10">{g.text}</span>
                         <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </button>
                 ))}
             </div>
          </div>
        )}
    </div>
  );
};

const CategorySection = ({ id, title, emojis, onSelect }: any) => (
    <div id={`emoji-cat-${id}`} className="mb-4">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase mb-2 ml-2 sticky top-0 bg-white/80 backdrop-blur-md p-1 rounded-md z-10 w-max">{title}</h3>
        <div className="grid grid-cols-7 gap-1">
            {emojis.map((e: string, i: number) => (
                <button key={i} onClick={() => onSelect(e)} className="text-[28px] h-10 w-10 flex items-center justify-center active:scale-75 transition-transform hover:bg-white/40 rounded-full">{e}</button>
            ))}
        </div>
    </div>
);
