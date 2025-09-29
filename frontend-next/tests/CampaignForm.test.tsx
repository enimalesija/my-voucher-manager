import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CampaignForm from "@/components/campaigns/CampaignForm";

describe("CampaignForm", () => {
  it("validates required fields", () => {
    // fake callbacks so we can check if they are called
    const pushToast = vi.fn();
    const onCreated = vi.fn();

    // create a query client just for testing
    const queryClient = new QueryClient();

    // render with QueryClientProvider
    render(
      <QueryClientProvider client={queryClient}>
        <CampaignForm pushToast={pushToast} onCreated={onCreated} />
      </QueryClientProvider>
    );

    // clicks the submit button without filling anything
    fireEvent.click(screen.getByRole("button", { name: /create campaign/i }));

    // expect that we get the generic error toast
    expect(pushToast).toHaveBeenCalledWith(
      "Please fix the highlighted fields",
      "error"
    );
  });
});
