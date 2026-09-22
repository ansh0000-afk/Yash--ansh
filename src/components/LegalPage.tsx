import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

type LegalType = 'terms' | 'privacy';

interface LegalPageProps {
  type: LegalType;
  onBack: () => void;
  onOpenOther: (type: LegalType) => void;
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-2">
    <h2 className="text-base md:text-lg font-bold text-white">
      {title}
    </h2>

    <div className="text-sm leading-6 text-slate-300 space-y-2">
      {children}
    </div>
  </section>
);

export const LegalPage: React.FC<LegalPageProps> = ({
  type,
  onBack,
  onOpenOther,
}) => {
  const isTerms = type === 'terms';

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-5 py-8 md:px-8 md:py-10">

        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Alpha AI
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-8 shadow-2xl">

          <div className="flex items-start gap-4 border-b border-slate-800 pb-6">

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              {isTerms ? (
                <FileText className="w-6 h-6 text-indigo-400" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {isTerms
                  ? 'Terms of Service'
                  : 'Privacy Policy'}
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Alpha AI · Last updated: September 22, 2026
              </p>
            </div>

          </div>

          <div className="mt-7 space-y-7">

            {isTerms ? (
              <>
                <Section title="1. About Alpha AI">
                  <p>
                    Alpha AI is an AI-powered workspace that provides
                    conversational assistance, study and productivity tools,
                    document processing, voice features, and related
                    application features.
                  </p>
                </Section>

                <Section title="2. Acceptance of these Terms">
                  <p>
                    By using Alpha AI, you agree to these Terms. If you do not
                    agree, do not use the service.
                  </p>
                </Section>

                <Section title="3. Accounts and Security">
                  <p>
                    You may use guest access or supported account
                    authentication. You are responsible for keeping your
                    account credentials and device security controls private.
                  </p>

                  <p>
                    App PIN, device authentication, and biometric features
                    are security features and should not be treated as a
                    replacement for your device's normal security controls.
                  </p>
                </Section>

                <Section title="4. AI Output">
                  <p>
                    AI responses can be incomplete, inaccurate, outdated, or
                    inappropriate for a particular situation. Verify important
                    information independently before relying on it.
                  </p>

                  <p>
                    Alpha AI is not a substitute for professional medical,
                    legal, financial, educational, or other professional advice.
                  </p>
                </Section>

                <Section title="5. Your Content">
                  <p>
                    You may provide messages, files, images, notes, tasks,
                    and other content. You are responsible for having the
                    rights and permissions needed to submit that content.
                  </p>
                </Section>

                <Section title="6. Acceptable Use">
                  <p>
                    Do not use Alpha AI to violate applicable law, abuse or
                    attack the service, attempt unauthorized access,
                    distribute malicious software, infringe another person's
                    rights, or interfere with the security or operation of
                    the service.
                  </p>
                </Section>

                <Section title="7. Availability and Changes">
                  <p>
                    Features, models, integrations, limits, and availability
                    may change over time. Features may be updated,
                    discontinued, or replaced.
                  </p>
                </Section>

                <Section title="8. Intellectual Property">
                  <p>
                    Alpha AI's application interface, branding, software,
                    and related materials are protected by applicable
                    intellectual-property laws. These Terms do not transfer
                    ownership of those materials to you.
                  </p>
                </Section>

                <Section title="9. Disclaimer">
                  <p>
                    To the extent permitted by applicable law, Alpha AI is
                    provided on an as-available basis. No guarantee is made
                    that every response, feature, or service will always be
                    available, secure, accurate, or error-free.
                  </p>
                </Section>

                <Section title="10. Contact">
                  <p>
                    For legal or support questions, use the official contact
                    method provided by the Alpha AI operator.
                  </p>
                </Section>
              </>
            ) : (
              <>
                <Section title="1. What this Policy Covers">
                  <p>
                    This Privacy Policy explains how Alpha AI handles
                    information when you use the application.
                  </p>
                </Section>

                <Section title="2. Information You Provide">
                  <p>
                    Depending on the features you use, this can include your
                    name, email address, profile image, account preferences,
                    chat messages, notes, tasks, and content you choose to
                    enter or upload.
                  </p>
                </Section>

                <Section title="3. Authentication Information">
                  <p>
                    Alpha AI uses Firebase Authentication for supported
                    sign-in methods, including Google sign-in and
                    email/password authentication.
                  </p>
                </Section>

                <Section title="4. Local Device Storage">
                  <p>
                    The current application stores several types of app data
                    in browser/device storage, including settings, chat
                    sessions, tasks, notes, preferences, and app-lock
                    configuration.
                  </p>
                </Section>

                <Section title="5. AI and API Processing">
                  <p>
                    Messages and, when applicable, attached document text or
                    other request content may be sent to Alpha AI API
                    endpoints so requested AI features can operate.
                  </p>
                </Section>

                <Section title="6. Files and Images">
                  <p>
                    If you upload a PDF, document, or image, the application
                    may process that content to provide the requested feature.
                    Do not upload sensitive information unless you understand
                    how it may be processed.
                  </p>
                </Section>

                <Section title="7. Security Features">
                  <p>
                    Alpha AI includes app-lock, device-authentication,
                    biometric, and privacy-related controls. These features
                    are intended to help protect access but cannot guarantee
                    absolute security.
                  </p>
                </Section>

                <Section title="8. Data Deletion and Export">
                  <p>
                    The application currently provides local data
                    export/import and local cache/data-clearing controls in
                    Settings.
                  </p>

                  <p>
                    Authentication is handled separately through Firebase.
                    Any server-side account-data deletion process should be
                    implemented according to the actual service architecture.
                  </p>
                </Section>

                <Section title="9. Third Parties">
                  <p>
                    Third-party services used by the current application
                    include Firebase Authentication and services configured
                    behind the Alpha AI API. Those providers may process
                    information under their own privacy terms.
                  </p>
                </Section>

                <Section title="10. Changes to this Policy">
                  <p>
                    This Policy may be updated when the application's data
                    practices change. Updated versions should show a new
                    effective or updated date.
                  </p>
                </Section>

                <Section title="11. Contact">
                  <p>
                    For privacy questions or requests, use the official
                    contact method provided by the Alpha AI operator.
                  </p>
                </Section>
              </>
            )}

            <div className="pt-5 border-t border-slate-800 flex flex-wrap gap-2">

              <button
                onClick={() =>
                  onOpenOther(isTerms ? 'privacy' : 'terms')
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white"
              >
                {isTerms
                  ? 'Read Privacy Policy'
                  : 'Read Terms of Service'}
              </button>

              <a
                href="https://firebase.google.com/support/privacy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Firebase Privacy Info
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};