import { render, screen } from "@testing-library/react";
import FeaturesSection from "../FeaturesSection";
import { Feature } from "@/types";

const mockFeatures: Feature[] = [
 {
 id: "1",
 title: "Test Feature 1",
 description: "This is a test feature description",
 iconUrl: "🎯",
 order: 1,
 },
 {
 id: "2",
 title: "Test Feature 2", 
 description: "Another test feature description",
 iconUrl: "💰",
 order: 2,
 },
];

describe("FeaturesSection", () => {
 it("renders default features when no features prop is provided", () => {
 render(<FeaturesSection />);
 
 expect(screen.getByText("Series & Collections")).toBeInTheDocument();
 expect(screen.getByText("Flexible Video Formats")).toBeInTheDocument();
 expect(screen.getByText("Direct Monetization")).toBeInTheDocument();
 expect(screen.getByText("Advanced Analytics")).toBeInTheDocument();
 expect(screen.getByText("Content Discovery")).toBeInTheDocument();
 expect(screen.getByText("Premium Memberships")).toBeInTheDocument();
 });

 it("renders provided features correctly", () => {
 render(<FeaturesSection features={mockFeatures} />);
 
 expect(screen.getByText("Test Feature 1")).toBeInTheDocument();
 expect(screen.getByText("Test Feature 2")).toBeInTheDocument();
 expect(screen.getByText("This is a test feature description")).toBeInTheDocument();
 expect(screen.getByText("Another test feature description")).toBeInTheDocument();
 });

 it("displays loading skeleton when loading is true", () => {
 const { container } = render(<FeaturesSection loading={true} />);
 
 const skeletons = container.querySelectorAll('.animate-pulse');
 expect(skeletons.length).toBe(6);

 expect(screen.queryByText("Series & Collections")).not.toBeInTheDocument();
 });

 it("sorts features by order property", () => {
 const unorderedFeatures: Feature[] = [
 {
 id: "2",
 title: "Second Feature",
 description: "Second description",
 iconUrl: "💰",
 order: 2,
 },
 {
 id: "1",
 title: "First Feature",
 description: "First description", 
 iconUrl: "🎯",
 order: 1,
 },
 ];

 render(<FeaturesSection features={unorderedFeatures} />);
 
 expect(screen.getByText("First Feature")).toBeInTheDocument();
 expect(screen.getByText("Second Feature")).toBeInTheDocument();

 const titles = screen.getAllByRole("heading", { level: 3 });
 expect(titles[0]).toHaveTextContent("First Feature");
 expect(titles[1]).toHaveTextContent("Second Feature");
 });

 it("renders correct number of features", () => {
 render(<FeaturesSection features={mockFeatures} />);
 
 expect(screen.getByText("Test Feature 1")).toBeInTheDocument();
 expect(screen.getByText("Test Feature 2")).toBeInTheDocument();
 expect(screen.queryByText("Test Feature 3")).not.toBeInTheDocument();
 });

 it("handles empty features array", () => {
 const { container } = render(<FeaturesSection features={[]} />);

 const grid = container.querySelector('.grid');
 expect(grid).toBeInTheDocument();
 expect(grid?.children).toHaveLength(0);
 });
});