// Previsualiza las piezas estéticas nuevas en un PNG.
const zlib = require('zlib'); const fs = require('fs');

const CHEST = ['....oooooooo....','..oohhhhhhhhoo..','.ohhwwwwwwwwhho.','.ohwGgwwwwgGwho.','.ohwGgwwwwgGwho.','.oooooooooooooo.','.owwGgwwwwgGwwo.','.owwGgwllwgGwwo.','.owwGgwlpwgGwwo.','.owwGgwllwgGwwo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.oooooooooooooo.','..xxxxxxxxxxxx..'];
const CHEST_OPEN = ['................','.Y............Y.','.oooooooooooooo.','.oWWWWWWWWWWWWo.','.oYYYYYYYYYYYYo.','.oYYYYYYYYYYYYo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.owwGgwwwwgGwwo.','.oooooooooooooo.','..xxxxxxxxxxxx..'];
const chestPal = { o:'#20140a',h:'#c5904c',w:'#9c6b34',g:'#f2c33d',G:'#ffe79a',l:'#ece3c6',p:'#4a3a16',x:'#0e0b1e',W:'#7a4f24',Y:'#fff3b0' };
const OWL = ['...o........o...','..oBo......oBo..','.oBBBBBBBBBBBBo.','oBBBBBBBBBBBBBBo','oBgggBBBBBBgggBo','oBgegBBBBBBgegBo','oBgpgBBBBBBgpgBo','oBgggBBkkBBgggBo','oBBBBBBkkBBBBBBo','oBffffffffffffBo','oBffFFffffFFffBo','.oBffffffffffBo.','.oBBffffffffBBo.','..oBBBBBBBBBBo..','...oBBBBBBBBo...','....kk..kk.....'];
const owlPal = { o:'#0b0a14',B:'#6a5aa6',f:'#cfc4ea',F:'#9d8fd0',g:'#f2c33d',e:'#f5f0ff',p:'#0b0a14',k:'#f2a93d' };
const CROWN = ['.g..g..g..g.','.gGgGgGgGGg.','.gggggggggg.','.grgggggrg..'];
const crownPal = { g:'#f2c33d',G:'#ffe79a',r:'#e0506a' };
const BASE = ['................','................','................','................','....ssssssss....','...ssssssssss...','...ssEssssEss...','...ssssssssss...','...sssmmmmsss...','....ssssssss....','.....ssssss.....','......ssss......','....cccccccc....','...cCttttttCc...','..cccccccccccc..','..cccccccccccc..'];
const SPIKY = ['...h.hh.hh.h....','..hHHHHHHHHHHh..','.hHHHHHHHHHHHHh.','.hHHHHHHHHHHHHh.','.hhh........hhh.','.hh..........hh.'];
const novaPal = { s:'#f0c8a0',h:'#e0379a',H:'#ff6fc0',E:'#ff6fc0',m:'#6e3f3f',c:'#161a2e',C:'#2a3350',t:'#ff6fc0' };
function merge(b,a){const n=Math.max(b.length,a.length),o=[];for(let y=0;y<n;y++){const B=b[y]||'',A=a[y]||'',w=Math.max(B.length,A.length,16);let r='';for(let x=0;x<w;x++){const ac=A[x]||' ',bc=B[x]||' ';r+=ac!==' '&&ac!=='.'?ac:bc;}o.push(r);}return o;}

const W=900,H=420,buf=Buffer.alloc(W*H*4);
const hex=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
const px=(x,y,c)=>{if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];buf[i+3]=255;};
const rect=(x,y,w,h,col)=>{const c=hex(col);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)px(xx,yy,c);};
const sprite=(g,p,ox,oy,s)=>{for(let y=0;y<g.length;y++)for(let x=0;x<g[y].length;x++){const ch=g[y][x];if(ch==='.'||ch===' '||!p[ch])continue;rect(ox+x*s,oy+y*s,s,s,p[ch]);}};
function panel(x,y,w,h){rect(x,y,w,h,'#1c1538');rect(x+3,y+3,w-6,h-6,'#6b5fa3');rect(x+4,y+4,w-8,h-8,'#221a45');}

rect(0,0,W,H,'#0e0b1e');
// Panel 1: cofre cerrado -> abierto
panel(24,24,420,250);
sprite(CHEST,chestPal,70,70,11);
rect(250,150,40,8,'#f2c33d'); // flecha
sprite(CHEST_OPEN,chestPal,300,70,11);
// Panel 2: lechuza
panel(468,24,180,250);
sprite(OWL,owlPal,492,70,9);
// Panel 3: avatar nivel maximo (marco oro + corona)
panel(672,24,204,250);
const av=merge(BASE,SPIKY);
rect(740,86,140,140,'#f2c33d'); // marco oro
rect(744,90,132,132,'#0e0b1e');
sprite(av,novaPal,748,94,8);
sprite(CROWN,crownPal,760,60,9); // corona encima
// Pie: tile de fondo (muestra)
panel(24,300,852,96);
for(let ty=0;ty<2;ty++)for(let tx=0;tx<26;tx++){
  const ox=40+tx*32,oy=316+ty*32;
  rect(ox,oy,32,32,'#14112e');rect(ox,oy,32,1,'#0e0b1e');rect(ox,oy+16,32,1,'#0e0b1e');
  rect(ox,oy,1,16,'#0e0b1e');rect(ox+16,oy+16,1,16,'#0e0b1e');rect(ox+2,oy+2,12,1,'#1b1640');px(ox+24,oy+8,hex('#2e2458'));
}

function crc32(b){let c=~0;for(let i=0;i<b.length;i++){c^=b[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xedb88320&-(c&1));}return ~c>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(td));return Buffer.concat([l,td,cr]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;buf.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
const png=Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
fs.writeFileSync(process.argv[2]||'/tmp/extras.png',png);console.log('ok');
