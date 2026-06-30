"use client";

import { useActionState, useState } from "react";
import { PillSelect } from "@/components/PillSelect";
import {
  CONNECTION_OPTIONS,
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
} from "@/lib/constants";
import { cityOptions } from "@/lib/geo";
import { completeOnboarding, OnboardingState } from "./actions";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {},
  );
  const [gender, setGender] = useState("woman");
  const [interestedIn, setInterestedIn] = useState("everyone");
  const [connection, setConnection] = useState("both");
  const cities = cityOptions();

  return (
    <form action={formAction} className="space-y-8">
      {/* Name */}
      <section className="space-y-2">
        <label htmlFor="name" className="label-eyebrow block">
          Your name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          className="field"
          placeholder="What should we call you?"
        />
      </section>

      {/* Birth date */}
      <section className="space-y-2">
        <label htmlFor="dob" className="label-eyebrow block">
          Date of birth · required
        </label>
        <input id="dob" name="dob" type="date" required className="field" />
        <p className="text-xs text-clay">
          Your birth date anchors every alignment.
        </p>
      </section>

      {/* Birth time + place (optional) */}
      <section className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="birthTime" className="label-eyebrow block">
            Birth hour · optional
          </label>
          <input id="birthTime" name="birthTime" type="time" className="field" />
        </div>
        <div className="space-y-2">
          <label htmlFor="birthPlace" className="label-eyebrow block">
            Birth place · optional
          </label>
          <input
            id="birthPlace"
            name="birthPlace"
            list="cities"
            className="field"
            placeholder="City of birth"
          />
          <datalist id="cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <p className="rounded-lg bg-grad-to/40 px-3 py-2 text-xs leading-relaxed text-clay">
          Birth time &amp; place let us read your moon and rising signs — part of
          the fuller Aligned+ reading. You can add them later.
        </p>
      </section>

      {/* Gender */}
      <section className="space-y-2">
        <span className="label-eyebrow block">I am a</span>
        <PillSelect
          name="gender"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={setGender}
        />
      </section>

      {/* Interested in */}
      <section className="space-y-2">
        <span className="label-eyebrow block">Interested in</span>
        <PillSelect
          name="interestedIn"
          options={INTERESTED_IN_OPTIONS}
          value={interestedIn}
          onChange={setInterestedIn}
        />
      </section>

      {/* Connection */}
      <section className="space-y-2">
        <span className="label-eyebrow block">Seeking</span>
        <PillSelect
          name="connection"
          options={CONNECTION_OPTIONS}
          value={connection}
          onChange={setConnection}
        />
      </section>

      {/* Consent */}
      <section className="space-y-3 rounded-2xl border border-hairline bg-white/40 p-4">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="consent18" value="yes" className="mt-1" />
          <span>I confirm I am 18 years of age or older.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="consentGuidelines"
            value="yes"
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <a href="/safety/guidelines" className="text-claret underline underline-offset-2">
              Community Guidelines
            </a>
            .
          </span>
        </label>
      </section>

      {state.error && <p className="text-sm text-claret">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full px-6 py-3.5"
      >
        {pending ? "Reading the heavens…" : "Let the universe choose"}
      </button>
    </form>
  );
}
