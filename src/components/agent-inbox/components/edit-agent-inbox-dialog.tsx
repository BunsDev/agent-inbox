import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { AGENT_INBOXES_LOCAL_STORAGE_KEY } from "../constants";
import { PasswordInput } from "@/components/ui/password-input";
import { AgentInbox } from "../types";
import { Pencil } from "lucide-react";
import { useLocalStorage } from "../hooks/use-local-storage";

export function EditAgentInboxDialog({
  agentInbox,
  langchainApiKey,
  handleChangeLangChainApiKey,
}: {
  /**
   * The agent inbox to edit
   */
  agentInbox: AgentInbox;
  langchainApiKey?: string;
  handleChangeLangChainApiKey?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  const { getItem, setItem } = useLocalStorage();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [graphId, setGraphId] = React.useState(agentInbox.graphId);
  const [deploymentUrl, setDeploymentUrl] = React.useState(
    agentInbox.deploymentUrl
  );
  const [name, setName] = React.useState(agentInbox.name || "");

  React.useEffect(() => {
    if (open) {
      setGraphId(agentInbox.graphId);
      setDeploymentUrl(agentInbox.deploymentUrl);
      setName(agentInbox.name || "");
    }
  }, [open, agentInbox]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Get current inboxes from local storage
    const agentInboxesStr = getItem(AGENT_INBOXES_LOCAL_STORAGE_KEY);
    if (!agentInboxesStr) {
      toast({
        title: "Error",
        description: "Could not find agent inboxes",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const agentInboxes: AgentInbox[] = JSON.parse(agentInboxesStr);

      // Update the specific inbox
      const updatedInboxes = agentInboxes.map((inbox) => {
        if (inbox.id === agentInbox.id) {
          return {
            ...inbox,
            graphId,
            deploymentUrl,
            name,
          };
        }
        return inbox;
      });

      // Save back to local storage
      setItem(AGENT_INBOXES_LOCAL_STORAGE_KEY, JSON.stringify(updatedInboxes));

      toast({
        title: "Success",
        description: "Agent inbox updated successfully",
        duration: 3000,
      });

      // Close the dialog
      setOpen(false);

      // Force a page reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating agent inbox", error);
      toast({
        title: "Error",
        description: "Failed to update agent inbox",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const isDeployedGraph = deploymentUrl.includes("default.us.langgraph.app");
  const showLangChainApiKeyField =
    langchainApiKey !== undefined &&
    handleChangeLangChainApiKey &&
    isDeployedGraph;

  return (
    <Dialog
      open={open}
      onOpenChange={(c) => {
        setOpen(c);
      }}
    >
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Inbox</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col items-center justify-center gap-4 py-4 w-full"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2 items-start justify-start w-full">
            <Label htmlFor="graph-id" className="text-right">
              Assistant/Graph ID <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              This is the ID of the graph (can be the graph name), or assistant
              to fetch threads from, and invoke when actions are taken.
            </p>
            <Input
              id="graph-id"
              placeholder="my_graph"
              className="col-span-3"
              required
              value={graphId}
              onChange={(e) => setGraphId(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 items-start justify-start w-full">
            <Label htmlFor="deployment-url" className="text-right">
              Deployment URL <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              This is the URL of your LangGraph deployment. Can be a local, or
              production deployment.
            </p>
            <Input
              id="deployment-url"
              placeholder="https://my-agent.default.us.langgraph.app"
              className="col-span-3"
              required
              value={deploymentUrl}
              onChange={(e) => setDeploymentUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 items-start justify-start w-full">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <p className="text-xs text-muted-foreground">
              Optional name for the inbox. Used in the sidebar.
            </p>
            <Input
              id="name"
              placeholder="My Agent"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {showLangChainApiKeyField && (
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex flex-col gap-1 w-full items-start">
                <Label htmlFor="langchain-api-key">
                  LangSmith API Key <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  This value is stored in your browser&apos;s local storage and
                  is only used to authenticate requests sent to your LangGraph
                  server.
                </p>
              </div>
              <PasswordInput
                id="langchain-api-key"
                placeholder="lsv2_pt_..."
                className="min-w-full"
                required
                value={langchainApiKey}
                onChange={handleChangeLangChainApiKey}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="brand" type="submit">
              Save
            </Button>
            <Button
              variant="outline"
              type="reset"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
