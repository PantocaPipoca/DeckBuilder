import bcrypt from 'bcryptjs';
import prisma from './database';
import { Rarity, CardType } from '@prisma/client';

/**
 * Generates the image URL for a card based on its name
 * @param name Card name
 * @returns Card image URL
 */
function getCardImageUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/'/g, '');
  return `https://cdn.royaleapi.com/static/img/cards-150/${slug}.png`;
}

const cards = [
  // === COMMON ===
  { name: 'Knight', elixir: 3, rarity: 'COMMON', type: 'TROOP', description: 'A tough melee fighter. The Barbarian\'s handsome, cultured cousin.' },
  { name: 'Archers', elixir: 3, rarity: 'COMMON', type: 'TROOP', description: 'A pair of lightly armored ranged attackers. They\'ll help you take down ground and air units.' },
  { name: 'Goblins', elixir: 2, rarity: 'COMMON', type: 'TROOP', description: 'Three fast, unarmored melee attackers. Small, fast, green and mean!' },
  { name: 'Bomber', elixir: 2, rarity: 'COMMON', type: 'TROOP', description: 'This crazed bomber throws powerful bombs that deal area damage. Best when attacking from behind a tank.' },
  { name: 'Minions', elixir: 3, rarity: 'COMMON', type: 'TROOP', description: 'Three fast, unarmored flying attackers. Roses are red, minions are blue!' },
  { name: 'Minion Horde', elixir: 5, rarity: 'COMMON', type: 'TROOP', description: 'Six fast, unarmored flying attackers. Three\'s a crowd, six is a horde!' },
  { name: 'Bats', elixir: 2, rarity: 'COMMON', type: 'TROOP', description: 'Five tiny flying creatures that deal damage fast. Great for taking out troops.' },
  { name: 'Ice Spirit', elixir: 1, rarity: 'COMMON', type: 'TROOP', description: 'Spawns one lively little Ice Spirit to freeze a group of enemies.' },
  { name: 'Fire Spirit', elixir: 1, rarity: 'COMMON', type: 'TROOP', description: 'Spawns one lively little Fire Spirit to deal area damage.' },
  { name: 'Royal Recruits', elixir: 7, rarity: 'COMMON', type: 'TROOP', description: 'Deploys a line of recruits armed with spears and shields. Deals double damage when attacking buildings.' },
  { name: 'Skeletons', elixir: 1, rarity: 'COMMON', type: 'TROOP', description: 'Three fast, very weak melee fighters. Surround your enemies with this pile of bones!' },
  { name: 'Skeleton Barrel', elixir: 3, rarity: 'COMMON', type: 'TROOP', description: 'It\'s a Skeleton party in a barrel! Drops 8 Skeletons onto your enemy\'s crown towers.' },
  { name: 'Rascals', elixir: 5, rarity: 'COMMON', type: 'TROOP', description: 'The Rascal Boy has a sweet tooth and he throws his Sweet Stuff to slow down enemies.' },
  { name: 'Firecracker', elixir: 3, rarity: 'COMMON', type: 'TROOP', description: 'She is a ranged splash damage troop. If she is left alone, her firecracker attacks get stronger!' },
  { name: 'Elite Barbarians', elixir: 6, rarity: 'COMMON', type: 'TROOP', description: 'Spawns a pair of leveled up Barbarians with mean mustaches and worse tempers!' },
  { name: 'Zap', elixir: 2, rarity: 'COMMON', type: 'SPELL', description: 'Zaps enemies, briefly stunning them and dealing damage inside a small radius.' },
  { name: 'Arrows', elixir: 3, rarity: 'COMMON', type: 'SPELL', description: 'Arrows pepper a large area, damaging all enemies hit.' },
  { name: 'Giant Snowball', elixir: 2, rarity: 'COMMON', type: 'SPELL', description: 'Rolls over enemies, damaging and slowing them. Hits flying troops too!' },
  { name: 'Royal Delivery', elixir: 3, rarity: 'COMMON', type: 'SPELL', description: 'Deals damage and slows down troops. Spawns a Royal Recruit after landing.' },
  { name: 'Cannon', elixir: 3, rarity: 'COMMON', type: 'BUILDING', description: 'Defensive building. Shoots cannonballs with deadly effect, but cannot target flying troops.' },
  { name: 'Mortar', elixir: 4, rarity: 'COMMON', type: 'BUILDING', description: 'Defensive building with a long range. Shoots exploding shells, but cannot target troops nearby.' },
  { name: 'Tesla', elixir: 4, rarity: 'COMMON', type: 'BUILDING', description: 'Defensive building. Whenever it\'s not zapping the enemy, the power of Electrickery is best shown in a coil of wire!' },

  // === RARE ===
  { name: 'Giant', elixir: 5, rarity: 'RARE', type: 'TROOP', description: 'Slow but durable, only attacks buildings. A real one-man wrecking crew!' },
  { name: 'Valkyrie', elixir: 4, rarity: 'RARE', type: 'TROOP', description: 'Tough melee fighter that targets ground troops. Swings her axe to deal area damage!' },
  { name: 'Musketeer', elixir: 4, rarity: 'RARE', type: 'TROOP', description: 'Don\'t be fooled by her delicately coiffed hair, the Musketeer is a mean shot with her trusty boomstick.' },
  { name: 'Mini P.E.K.K.A.', elixir: 4, rarity: 'RARE', type: 'TROOP', description: 'The Arena is a certified butterfly-free zone. No distractions for P.E.K.K.A, only destruction.' },
  { name: 'Hog Rider', elixir: 4, rarity: 'RARE', type: 'TROOP', description: 'Fast melee troop that targets buildings and can jump over the river. He followed the echoing call of Hog Rider all the way through the arena doors.' },
  { name: 'Mega Minion', elixir: 3, rarity: 'RARE', type: 'TROOP', description: 'Flying, deals moderate damage, has high hitpoints. He lands with the force of 1000 mustaches.' },
  { name: 'Three Musketeers', elixir: 9, rarity: 'RARE', type: 'TROOP', description: 'Trio of powerful, independent markswomen, fighting for justice and honor. Disliking Barbarians, eyeliner, and ice cream.' },
  { name: 'Ice Golem', elixir: 2, rarity: 'RARE', type: 'TROOP', description: 'He\'s slow and doesn\'t deal much damage, but he has a lot of hitpoints and slows nearby enemies when destroyed.' },
  { name: 'Royal Giant', elixir: 6, rarity: 'RARE', type: 'TROOP', description: 'Destroying enemy buildings with his massive cannon is his job; making a raggedy blond beard look good is his passion.' },
  { name: 'Spear Goblins', elixir: 2, rarity: 'RARE', type: 'TROOP', description: 'Three unarmored ranged attackers. Who the heck taught these guys to throw spears!?' },
  { name: 'Tombstone', elixir: 3, rarity: 'RARE', type: 'BUILDING', description: 'Defensive building. Spawns Skeletons periodically. When destroyed, spawns 4 Skeletons.' },
  { name: 'Inferno Tower', elixir: 5, rarity: 'RARE', type: 'BUILDING', description: 'Defensive building. Gradually increases damage. Excellent for taking down high-hitpoint enemies.' },
  { name: 'Furnace', elixir: 4, rarity: 'RARE', type: 'BUILDING', description: 'Defensive building that spawns Fire Spirits. But the spirits are free!' },
  { name: 'Elixir Collector', elixir: 6, rarity: 'RARE', type: 'BUILDING', description: 'Produces Elixir over time. Protect it to maximize your gains!' },
  { name: 'Rocket', elixir: 6, rarity: 'RARE', type: 'SPELL', description: 'Deals high damage to a small area. Looks really awesome doing it. Reduced damage to Crown Towers.' },
  { name: 'Earthquake', elixir: 3, rarity: 'RARE', type: 'SPELL', description: 'Quakes the ground, damages buildings. Can\'t affect troops, only buildings.' },
  { name: 'Heal Spirit', elixir: 1, rarity: 'RARE', type: 'SPELL', description: 'A happy spirit that heals nearby friendly troops. Can be placed anywhere on the battlefield.' },

 // === EPIC ===
  { name: 'P.E.K.K.A', elixir: 7, rarity: 'EPIC', type: 'TROOP', description: 'A heavily armored, slow melee fighter. Deals high damage and has high hitpoints.' },
  { name: 'Golem', elixir: 8, rarity: 'EPIC', type: 'TROOP', description: 'Slow but durable, only attacks buildings. When destroyed, splits into two Golemites!' },
  { name: 'Baby Dragon', elixir: 4, rarity: 'EPIC', type: 'TROOP', description: 'Burps out big fireballs that deal splash damage. Tanky and deals area damage!' },
  { name: 'Witch', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'Summons Skeletons, shoots destructive fireballs from a distance. Please excuse her, she isn\'t a morning person.' },
  { name: 'Prince', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'Don\'t let the little pony fool you. Once the Prince gets a running start, you WILL be trampled.' },
  { name: 'Dark Prince', elixir: 4, rarity: 'EPIC', type: 'TROOP', description: 'The Dark Prince deals area damage and lets his spiked club do the talking for him - because when he does talk, it sounds like he has a bucket on his head.' },
  { name: 'Executioner', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'He throws his axe like a boomerang, striking all enemies on the way out AND back.' },
  { name: 'Bowler', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'This big blue dude digs the simple things in life - Dark Elixir drinks and throwing rocks.' },
  { name: 'Balloon', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'As pretty as they are, you won\'t want a parade of THESE balloons showing up on the horizon.' },
  { name: 'Hunter', elixir: 4, rarity: 'EPIC', type: 'TROOP', description: 'He deals BIG area damage up close, less from far away. Get in his face and he\'ll give you a face full of pellets!' },
  { name: 'Giant Skeleton', elixir: 6, rarity: 'EPIC', type: 'TROOP', description: 'The bigger the skeleton, the bigger the bomb. Carries a bomb that blows up when he dies!' },
  { name: 'Goblin Giant', elixir: 6, rarity: 'EPIC', type: 'TROOP', description: 'He\'s got a huge shield and two loyal Spear Goblins on his back. What could be better?' },
  { name: 'Electro Dragon', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'Electroshocks up to three troops or buildings at once. Attacks slow, but hits hard!' },
  { name: 'Cannon Cart', elixir: 5, rarity: 'EPIC', type: 'TROOP', description: 'A Cannon on wheels? Bet they won\'t see that coming! Once you break its shield, it becomes a cannon building.' },
  { name: 'Wall Breakers', elixir: 2, rarity: 'EPIC', type: 'TROOP', description: 'A pair of lightly armored bombers seek out buildings. Deals extra damage to buildings!' },
  { name: 'Skeleton Army', elixir: 3, rarity: 'EPIC', type: 'TROOP', description: 'Spawns an army of Skeletons. Useful for distracting and surrounding troops.' },
  { name: 'Goblin Drill', elixir: 4, rarity: 'EPIC', type: 'BUILDING', description: 'Drills into the ground and spawns Goblins anywhere in the arena. A portable Goblin Hut!' },
  { name: 'X-Bow', elixir: 6, rarity: 'EPIC', type: 'BUILDING', description: 'A building that can hit enemy Crown Towers from your side of the Arena. Long range and packs a punch!' },
  { name: 'Freeze', elixir: 4, rarity: 'EPIC', type: 'SPELL', description: 'Freezes troops and buildings, making them unable to move or attack. Doesn\'t affect Crown Towers.' },
  { name: 'Lightning', elixir: 6, rarity: 'EPIC', type: 'SPELL', description: 'Bolts of lightning damage and stun the three enemy troops or buildings with the highest hitpoints in the target area.' },
  { name: 'Poison', elixir: 4, rarity: 'EPIC', type: 'SPELL', description: 'Covers the target area in a sticky toxin, damaging and slowing down troops and buildings.' },
  { name: 'Tornado', elixir: 3, rarity: 'EPIC', type: 'SPELL', description: 'Drags enemy troops to its center while dealing damage over time. Can be used to activate the King\'s Tower!' },
  { name: 'Mirror', elixir: 0, rarity: 'EPIC', type: 'SPELL', description: 'Mirrors your last card played for +1 Elixir. Does NOT mirror Elixir Collector!' },
  { name: 'Clone', elixir: 3, rarity: 'EPIC', type: 'SPELL', description: 'Duplicates all friendly troops in the target area. Cloned troops are fragile, but pack the same punch!' },
  { name: 'Rage', elixir: 2, rarity: 'EPIC', type: 'SPELL', description: 'Increases the movement speed and attack speed of friendly troops. Chug! Chug! Chug!' },
  { name: 'Barbarian Barrel', elixir: 2, rarity: 'EPIC', type: 'SPELL', description: 'A rolling barrel that deals damage. Spawns a Barbarian when destroyed!' },
  { name: 'Goblin Curse', elixir: 2, rarity: 'EPIC', type: 'SPELL', description: 'Turns enemy troops into Goblins for a few seconds!' },
  { name: 'Goblin Cage', elixir: 4, rarity: 'EPIC', type: 'BUILDING', description: 'Spawns a Goblin Brawler once destroyed. Doesn\'t target air units.' },
  { name: 'Vines', elixir: 3, rarity: 'EPIC', type: 'SPELL', description: 'Sprouts vines on both sides of the Arena that pull troops, slow them down and make them retarget.' },

  // === LEGENDARY ===
  { name: 'Mega Knight', elixir: 7, rarity: 'LEGENDARY', type: 'TROOP', description: 'He jumps on his enemies, stunning them and dealing massive damage. He has armor of steel and a mustache of night!' },
  { name: 'Miner', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'The Miner can be deployed anywhere in the arena. It\'s not magic, it\'s a shovel. A shovel that digs really, really fast.' },
  { name: 'Princess', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'This stunning Princess shoots flaming arrows from long range. If you\'re feeling warm feelings towards her, it\'s probably because you\'re on fire.' },
  { name: 'Ice Wizard', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'This chill caster throws ice shards that slow down enemies\' movement and attack speed. Despite being freezing cold, he has a warm personality!' },
  { name: 'Lava Hound', elixir: 7, rarity: 'LEGENDARY', type: 'TROOP', description: 'The Lava Hound is a majestic flying beast that attacks buildings. The Lava Pups are less majestic angry babies that attack anything.' },
  { name: 'Inferno Dragon', elixir: 4, rarity: 'LEGENDARY', type: 'TROOP', description: 'Shoots a focused beam of fire that increases in damage over time. Wears a helmet because flying can be dangerous.' },
  { name: 'Sparky', elixir: 6, rarity: 'LEGENDARY', type: 'TROOP', description: 'Sparky slowly charges up, then unloads MASSIVE area damage. Overkill isn\'t in her vocabulary.' },
  { name: 'Magic Archer', elixir: 4, rarity: 'LEGENDARY', type: 'TROOP', description: 'He\'s a Legendary sharpshooter with incredible range and a magic arrow that keeps on flying and damaging everything in its path.' },
  { name: 'Night Witch', elixir: 4, rarity: 'LEGENDARY', type: 'TROOP', description: 'Summons Bats to do her bidding. Raised from the dead, she can summon Bats from the dead, too!' },
  { name: 'Bandit', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'The Bandit dashes to her target and delivers an extra big hit! While dashing, she can\'t be touched.' },
  { name: 'Royal Ghost', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'He drifts silently and invisibly through the arena until he attacks or takes damage.' },
  { name: 'Ram Rider', elixir: 5, rarity: 'LEGENDARY', type: 'TROOP', description: 'The Ram Rider charges through the Arena, dealing damage to Crown Towers. The rider snares enemies with her bola!' },
  { name: 'Fisherman', elixir: 3, rarity: 'LEGENDARY', type: 'TROOP', description: 'He\'ll hook you and bring you right next to him for a beating. The first time, it\'s funny. After that, it\'s just rude.' },
  { name: 'The Log', elixir: 2, rarity: 'LEGENDARY', type: 'SPELL', description: 'A Legendary log that knocks back small troops and damages all ground troops in its path. A Legendary log! What\'s it worth to you?' },
  { name: 'Graveyard', elixir: 5, rarity: 'LEGENDARY', type: 'SPELL', description: 'Surprise! It\'s a party. A Skeleton party. Anywhere in the Arena. Yay!' },
  { name: 'Spirit Empress', elixir: 6, rarity: 'LEGENDARY', type: 'SPELL', description: 'She summons spirits to heal your troops and damage enemies. A true master of the spiritual arts!' },
];

async function main() {

  const hashedPassword = await bcrypt.hash('devdev', 10);
  await prisma.user.upsert({
    where: { email: 'dev@dev.com' },
    update: {},
    create: {
      email: 'dev@dev.com',
      password: hashedPassword,
      name: 'dev',
    },
  });
  await prisma.card.deleteMany();
  
  for (const card of cards) {
    await prisma.card.create({
      data: {
        name: card.name,
        elixir: card.elixir,
        rarity: card.rarity as Rarity,
        type: card.type as CardType,
        description: card.description,
        iconUrl: getCardImageUrl(card.name),
      },
    });
  }

  console.log(`Created ${cards.length} cards`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });