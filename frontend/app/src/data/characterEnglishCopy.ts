type CharacterCopy = {
  ability: string
  script: string
}

export const characterEnglishCopy: Record<string, CharacterCopy> = {
  lone_wolf: {
    ability: "You only win if you are the last surviving wolf.",
    script: "Lone Wolf, wake up so I can record your role.",
  },
  halfblood: {
    ability: "When checked by the Seer, you appear as a Werewolf.",
    script: "Halfblood, wake up so I can record your role.",
  },
  mayor: {
    ability: "Your vote counts as two votes.",
    script: "Mayor, wake up so I can record your role.",
  },
  tough_guy: {
    ability: "If the wolves attack you, you do not die immediately and survive until the next night.",
    script: "Tough Guy, wake up so I can record your role.",
  },
  rusty_knight: {
    ability: "If wolves kill you, one of them is infected by your rusty sword. The wolf immediately to your left dies the following night. You must not reveal your role while alive, or this ability is lost.",
    script: "Rusty Knight, wake up so I can record your role.",
  },
  diseased: {
    ability: "If wolves kill you, they become diseased and cannot kill anyone the following night.",
    script: "Diseased, wake up so I can record your role.",
  },
  hoodlum: {
    ability: "Choose two players on the first night. You win if both players die and you remain alive until the game ends.",
    script: "Hoodlum, wake up and choose two players as your targets.",
  },
  cupid: {
    ability: "On the first night, choose two players to become lovers. If one dies, the other dies as well.",
    script: "Cupid, wake up and choose two players to become lovers. You may choose yourself.",
  },
  guard: {
    ability: "Protect one player each night. That player cannot be killed by the wolves that night. You cannot protect the same player on consecutive nights.",
    script: "Guard, wake up. Who do you want to protect tonight?",
  },
  priest: {
    ability: "At night, bless one player once per game. That player cannot die at night, except by suicide.",
    script: "Priest, wake up. Who do you want to bless?",
  },
  werewolf: {
    ability: "Each night, the Werewolves agree on one player to devour. The victim dies at the beginning of the next day.",
    script: "Werewolves, wake up, look at one another, and choose one player to devour tonight.",
  },
  fruit_wolf: {
    ability: "If you are the last remaining wolf, you cannot devour anyone.",
    script: "Fruit Wolf, wake up so the other Werewolves can identify you.",
  },
  wolf_cub: {
    ability: "If the Wolf Cub is killed, the wolves may devour two players the following night.",
    script: "Wolf Cub, raise your hand so the other Werewolves can identify you.",
  },
  minion: {
    ability: "You wake with the Werewolves and know who they are. You help them eliminate the Village, but the Seer sees you as a Villager.",
    script: "Minion, raise your hand so the Werewolves can identify you.",
  },
  alpha_wolf: {
    ability: "After the wolves select a target, you may turn that target into a Werewolf instead of devouring them. You may do this once per game if the attack succeeds.",
    script: "Alpha Wolf, wake up. Do you want to turn tonight's target into a Werewolf?",
  },
  fang_face: {
    ability: "On the first night, you wake with the other Werewolves. On later nights, you remain asleep until you are the only wolf left.",
    script: "Fang Face, wake up to check whether you are the last remaining wolf.",
  },
  vampire: {
    ability: "Each night, the Vampires choose one player to bite. The victim dies at the end of the following day.",
    script: "Vampires, wake up, look at one another, and choose one player to bite tonight.",
  },
  witch: {
    ability: "You have two single-use potions: one healing potion and one poison potion.",
    script: "Witch, wake up. This is tonight's wolf victim. Do you want to use your healing potion? Who, if anyone, do you want to poison?",
  },
  seer: {
    ability: "Each night, choose one player to learn whether that player is a Werewolf.",
    script: "Seer, wake up and choose one player to learn whether they are a Werewolf.",
  },
  aura_seer: {
    ability: "Each night, choose one player to learn whether they have a special role other than Villager, Werewolf, or Vampire.",
    script: "Aura Seer, wake up and choose one player to learn whether they have a special role.",
  },
  mystic_seeker: {
    ability: "Each night, choose one player and learn their exact role.",
    script: "Mystic Seeker, wake up and choose one player to learn their exact role.",
  },
  apprentice_seer: {
    ability: "If the Seer dies, you become the new Seer.",
    script: "Apprentice Seer, wake up to learn whether you have become the Seer. If you have, choose one player to learn whether they are a Werewolf.",
  },
  sorceress: {
    ability: "Each night, search for the Seer. You belong to the Werewolf faction, but the Seer sees you as a Villager.",
    script: "Sorceress, wake up and search for the Seer.",
  },
  hunter: {
    ability: "When you die, you may kill one other player.",
    script: "Hunter, wake up. Who do you want to kill? You may choose nobody.",
  },
  huntress: {
    ability: "At night, you may kill one other player once per game.",
    script: "Huntress, wake up. Who do you want to shoot? You may choose nobody.",
  },
  investigator: {
    ability: "Once per game, choose one player. You learn whether that player or either adjacent player is a Werewolf.",
    script: "Investigator, wake up. Do you want to investigate someone? You may wait until a later night.",
  },
  spellcaster: {
    ability: "Each night, choose one player who cannot speak during the following day.",
    script: "Spellcaster, wake up. Who do you want to silence? You may choose nobody.",
  },
  cursed: {
    ability: "You begin on the Village faction, but if the wolves attack you, you become a Werewolf.",
    script: "Cursed, wake up to learn whether you have become a Werewolf.",
  },
  old_hag: {
    ability: "Each night, choose one player who must leave the village during the following day.",
    script: "Old Hag, wake up. Who must leave the village tomorrow? You may choose nobody.",
  },
  mentalist: {
    ability: "Each night, choose two players and learn whether they belong to the same faction.",
    script: "Mentalist, wake up and choose two players to learn whether they belong to the same faction.",
  },
  gambler: {
    ability: "Each night after the first, choose one player. If that player is a Werewolf, they die. Otherwise, you die.",
    script: "Gambler, wake up. Who do you want to gamble against tonight?",
  },
  cult_leader: {
    ability: "Each night, recruit one player into your cult. You win when every surviving player belongs to the cult.",
    script: "Cult Leader, wake up and choose one player to join your cult.",
  },
  prince: {
    ability: "If the village votes to execute you during the day, reveal your role and survive.",
    script: "",
  },
  tanner: {
    ability: "You only win if the village executes you during the day.",
    script: "",
  },
  villager: {
    ability: "You have no special ability. Find and execute the Werewolves or Vampires.",
    script: "",
  },
}

type LocalizableCharacter = {
  id: string
  ability: string
  script: string
}

export function localizedCharacterAbility(character: LocalizableCharacter, lang: "vi" | "en") {
  return lang === "en" ? characterEnglishCopy[character.id]?.ability ?? character.ability : character.ability
}

export function localizedCharacterScript(character: LocalizableCharacter, lang: "vi" | "en") {
  return lang === "en" ? characterEnglishCopy[character.id]?.script ?? character.script : character.script
}
