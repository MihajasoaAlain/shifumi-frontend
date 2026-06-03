"use client";

import {
  ArrowClockwise,
  ArrowLeft as PhArrowLeft,
  Bell as PhBell,
  Check as PhCheck,
  Coins,
  Eye as PhEye,
  GameController,
  HandFist,
  HandPalm,
  Handshake as PhHandshake,
  Hourglass as PhHourglass,
  Plus as PhPlus,
  Question as PhQuestion,
  Scissors as PhScissors,
  Sparkle,
  Trophy as PhTrophy,
  X,
  type Icon,
  type IconProps,
  type IconWeight,
} from "@phosphor-icons/react";

export type SvgIcon = Icon;

/**
 * Project icon set, backed by Phosphor Icons.
 * Pictograms use the "duotone" weight (soft tinted fill + stroke, very
 * SF-Symbols-like); action glyphs use "bold" for a crisp affordance.
 * Everything inherits color via `currentColor` and is sized with Tailwind
 * `h-*`/`w-*` classes, exactly like before.
 */
function make(Base: Icon, weight: IconWeight): Icon {
  function Wrapped(props: IconProps) {
    return <Base weight={weight} {...props} />;
  }
  Wrapped.displayName = `Icon(${Base.displayName ?? "phosphor"})`;
  return Wrapped as unknown as Icon;
}

// Rock · Paper · Scissors — universal hand gestures.
export const Rock = make(HandFist, "duotone");
export const Paper = make(HandPalm, "duotone");
export const Scissors = make(PhScissors, "duotone");

// Game / UI pictograms.
export const Trophy = make(PhTrophy, "duotone");
export const Controller = make(GameController, "duotone");
export const Eye = make(PhEye, "duotone");
export const Handshake = make(PhHandshake, "duotone");
export const Bell = make(PhBell, "duotone");
export const Hourglass = make(PhHourglass, "duotone");
export const Sparkles = make(Sparkle, "duotone");
export const Coin = make(Coins, "duotone");
export const Question = make(PhQuestion, "duotone");

// Action glyphs.
export const Check = make(PhCheck, "bold");
export const Replay = make(ArrowClockwise, "bold");
export const Plus = make(PhPlus, "bold");
export const ArrowLeft = make(PhArrowLeft, "bold");
export const Close = make(X, "bold");
