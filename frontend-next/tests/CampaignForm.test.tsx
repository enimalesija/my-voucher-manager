import { render, screen, fireEvent } from "@testing-library/react";
import CampaignForm from "@/components/campaigns/CampaignForm";

// tests for the CampaignForm component
describe("CampaignForm", () => {
  it("validates required fields", () => {
    // fake callbacks so we can check if they are called
    const pushToast = vi.fn();
    const onCreated = vi.fn();

    // renders the form with our fake props
    render(<CampaignForm pushToast={pushToast} onCreated={onCreated} />);

    // clicks the submit button without filling anything
    fireEvent.click(screen.getByRole("button", { name: /create campaign/i }));

    // expect that we get the generic error toast
    expect(pushToast).toHaveBeenCalledWith(
      "Please fix the highlighted fields",
      "error"
    );
  });
});
