import { PageHeader } from "@/components/studio/PageHeader";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { Connectors } from "@/components/budget/Connectors";
import { AgentConsole } from "@/components/budget/AgentConsole";

export default function BudgetPage() {
  return (
    <div>
      <PageHeader step="Step 4 · Budget agent" title={<>Tell it what you can spend, <span className="display-italic accent">and where.</span></>} blurb="Budget, source preferences and marketplace authorisations. The agent then searches every source, keeps only what fits your design language, and optimises the mix." />
      <div className="grid xl:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4 min-w-0">
          <BudgetForm />
          <Connectors />
        </div>
        <AgentConsole />
      </div>
    </div>
  );
}
