import { render, screen } from "@testing-library/react";
import FeatureCard from "../FeatureCard";
import { Feature } from "@/types";

const mockFeature: Feature = {
 id: "1",
 title: "Test Feature",
 description: "This is a test feature description that explains the functionality",
 iconUrl: "🎯",
 order: 1,
};

describe("FeatureCard", () => {
 it("renders feature information correctly", () => {
 render(<FeatureCard feature={mockFeature} />);
 
 expect(screen.getByText("Test Feature")).toBeInTheDocument();
 expect(screen.getByText("This is a test feature description that explains the functionality")).toBeInTheDocument();
 expect(screen.getByRole("img", { name: "Test Feature" })).toBeInTheDocument();
 });

 it("displays the feature icon", () => {
 render(<FeatureCard feature={mockFeature} />);
 
 const icon = screen.getByRole("img", { name: "Test Feature" });
 expect(icon).toHaveTextContent("🎯");
 });

 it("applies correct CSS classes for styling", () => {
 const { container } = render(<FeatureCard feature={mockFeature} />);
 
 const card = container.querySelector('.bg-neutral-white\\/10');
 expect(card).toHaveClass("bg-neutral-white/10", "backdrop-blur-sm", "rounded-2xl");
 });

 it("renders title as heading", () => {
 render(<FeatureCard feature={mockFeature} />);
 
 const title = screen.getByRole("heading", { level: 3 });
 expect(title).toHaveTextContent("Test Feature");
 });

 it("handles long descriptions gracefully", () => {
 const longDescriptionFeature: Feature = {
 ...mockFeature,
 description: "This is a very long description that should wrap properly and maintain readability even when it contains a lot of text that explains the feature in great detail with multiple sentences and comprehensive information about what the feature does and how it benefits users.",
 };

 render(<FeatureCard feature={longDescriptionFeature} />);
 
 expect(screen.getByText(longDescriptionFeature.description)).toBeInTheDocument();
 });

 it("handles different icon types", () => {
 const emojiFeature: Feature = {
 ...mockFeature,
 iconUrl: "💰",
 };

 render(<FeatureCard feature={emojiFeature} />);
 
 const icon = screen.getByRole("img", { name: "Test Feature" });
 expect(icon).toHaveTextContent("💰");
 });
});