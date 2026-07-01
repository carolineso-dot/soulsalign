"use client";

import { useActionState, useState } from "react";
import { PillSelect } from "@/components/PillSelect";
import { PhotoUploader, EditablePhoto } from "@/components/PhotoUploader";
import {
  CONNECTION_OPTIONS,
  GENDER_OPTIONS,
  INTERESTED_IN_OPTIONS,
} from "@/lib/constants";
import { cityOptions } from "@/lib/geo";
import { updateProfile, EditState } from "../actions";

type Initial = {
  name: string;
  essence: string;
  bio: string;
  interests: string;
  height: string;
  gender: string;
  interestedIn: string;
  connection: string;
  location: string;
  incognito: boolean;
  dob: string; // yyyy-mm-dd
  birthTime: string; // HH:MM
  birthPlace: string;
  birthLocked: boolean;
};

export function EditForm({
  initial,
  photos,
}: {
  initial: Initial;
  photos: EditablePhoto[];
}) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    updateProfile,
    {},
  );
  const [gender, setGender] = useState(initial.gender || "woman");
  const [interestedIn, setInterestedIn] = useState(initial.interestedIn || "everyone");
  const [connection, setConnection] = useState(initial.connection || "both");

  return (
    <div className="space-y-10">
      {/* photos — managed independently of the text form */}
      <section className="space-y-3">
        <p className="label-eyebrow">Photos</p>
        <PhotoUploader photos={photos} />
      </section>

      <form action={formAction} className="space-y-8">
        <section className="space-y-2">
          <label htmlFor="name" className="label-eyebrow block">Name</label>
          <input id="name" name="name" defaultValue={initial.name} required className="field" />
        </section>

        <section className="space-y-2">
          <label htmlFor="essence" className="label-eyebrow block">Essence · one line</label>
          <input id="essence" name="essence" defaultValue={initial.essence} maxLength={140} className="field" placeholder="A single line that captures you" />
        </section>

        <section className="space-y-2">
          <label htmlFor="bio" className="label-eyebrow block">About</label>
          <textarea id="bio" name="bio" defaultValue={initial.bio} rows={4} maxLength={600} className="field resize-none" />
        </section>

        <section className="space-y-2">
          <label htmlFor="interests" className="label-eyebrow block">Interests · comma separated</label>
          <input id="interests" name="interests" defaultValue={initial.interests} className="field" placeholder="Poetry, Hiking, Jazz" />
        </section>

        <section className="space-y-2">
          <label htmlFor="height" className="label-eyebrow block">Height · cm</label>
          <input id="height" name="height" type="number" min={120} max={230} defaultValue={initial.height} className="field" />
        </section>

        <section className="space-y-2">
          <label htmlFor="location" className="label-eyebrow block">Where you live</label>
          <input id="location" name="location" list="cities-loc" defaultValue={initial.location} className="field" placeholder="Your city" />
          <datalist id="cities-loc">
            {cityOptions().map((c) => <option key={c} value={c} />)}
          </datalist>
        </section>

        <section className="space-y-2">
          <span className="label-eyebrow block">I am a</span>
          <PillSelect name="gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
        </section>

        <section className="space-y-2">
          <span className="label-eyebrow block">Interested in</span>
          <PillSelect name="interestedIn" options={INTERESTED_IN_OPTIONS} value={interestedIn} onChange={setInterestedIn} />
        </section>

        <section className="space-y-2">
          <span className="label-eyebrow block">Seeking</span>
          <PillSelect name="connection" options={CONNECTION_OPTIONS} value={connection} onChange={setConnection} />
        </section>

        {/* Birth details — locked after verification */}
        <section className="space-y-3 rounded-2xl border border-hairline bg-white/40 p-4">
          <div className="flex items-center justify-between">
            <p className="label-eyebrow">Birth details</p>
            {initial.birthLocked && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] text-gold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8843b" strokeWidth="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                Locked
              </span>
            )}
          </div>

          {initial.birthLocked ? (
            <p className="text-xs leading-relaxed text-clay">
              Your birth details anchor every alignment, so they&rsquo;re fixed
              once you&rsquo;re verified.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <label htmlFor="dob" className="text-xs text-clay">Date of birth</label>
                <input id="dob" name="dob" type="date" defaultValue={initial.dob} className="field" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="birthTime" className="text-xs text-clay">Birth hour (for moon &amp; rising)</label>
                <input id="birthTime" name="birthTime" type="time" defaultValue={initial.birthTime} className="field" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="birthPlace" className="text-xs text-clay">Birth place</label>
                <input id="birthPlace" name="birthPlace" list="cities" defaultValue={initial.birthPlace} className="field" />
                <datalist id="cities">
                  {cityOptions().map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <p className="text-xs text-clay">
                Changing these re-reads your alignment. They lock permanently once
                you verify.
              </p>
            </>
          )}
        </section>

        {/* incognito */}
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="incognito" value="yes" defaultChecked={initial.incognito} className="mt-1" />
          <span>
            Incognito — browse privately; you won&rsquo;t appear in others&rsquo;
            alignments.
          </span>
        </label>

        {state.error && <p className="text-sm text-claret">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
