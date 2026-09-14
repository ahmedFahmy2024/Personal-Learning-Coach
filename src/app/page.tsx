import { LearningCoach } from "@/components/learning-coach";
import { createSampleSession } from "@/lib/sample-data";

/**
 * Server Component. It builds the serializable sample session and hands it to
 * the client island as a prop; all browser state lives inside
 * `<LearningCoach />`.
 */
export default function Home() {
  return <LearningCoach initialSession={createSampleSession()} />;
}
