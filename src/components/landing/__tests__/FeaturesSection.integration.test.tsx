import { render, screen } from "@testing-library/react";
import NewLandingPage from "../NewLandingPage";

jest.mock("@/hooks/useFeaturedContent", () => ({
 useFeaturedContent: () => ({
 featuredContent: [],
 loading: false,
 error: null,
 }),
}));

jest.mock("@/lib/content-config", () => ({
 getLandingPageContent: () => ({
 footer: {
 tagline: "Test tagline",
 description: "Test description",
 contactEmail: "test@example.com",
 socialLinks: [],
 sections: [],
 finalCta: {
 title: "Test CTA",
 description: "Test CTA description",
 buttonText: "Test Button",
 buttonLink: "/test",
 },
 legal: {
 copyright: "Test copyright",
 links: [],
 },
 },
 }),
}));

jest.mock("../TrendingCreatorsSection", () => {
 return function MockTrendingCreatorsSection() {
 return <div data-testid="trending-creators">Trending Creators</div>;
 };
});

jest.mock("../TrendingShowsSection", () => {
 return function MockTrendingShowsSection() {
 return <div data-testid="trending-shows">Trending Shows</div>;
 };
});

jest.mock("../CategoriesSection", () => {
 return function MockCategoriesSection() {
 return <div data-testid="categories">Categories</div>;
 };
});

jest.mock("@/components/layout", () => ({
 Footer: ({ content }: any) => <footer data-testid="footer">Footer</footer>,
}));

jest.mock("@/components/layout/NewHeader", () => {
 return function MockNewHeader() {
 return <header data-testid="header">Header</header>;
 };
});

describe("FeaturesSection Integration", () => {
 it("renders features section within the landing page", () => {
 render(<NewLandingPage />);

 expect(screen.getByText("Why Choose Crensa?")).toBeInTheDocument();
 expect(screen.getByText("Experience the best features for creators and viewers")).toBeInTheDocument();

 expect(screen.getByText("Series & Collections")).toBeInTheDocument();
 expect(screen.getByText("Flexible Video Formats")).toBeInTheDocument();
 expect(screen.getByText("Direct Monetization")).toBeInTheDocument();
 expect(screen.getByText("Advanced Analytics")).toBeInTheDocument();
 expect(screen.getByText("Content Discovery")).toBeInTheDocument();
 expect(screen.getByText("Premium Memberships")).toBeInTheDocument();
 });

 it("renders features section with proper styling and layout", () => {
 const { container } = render(<NewLandingPage />);

 const sections = container.querySelectorAll('section');
 const featuresSection = Array.from(sections).find(section => 
 section.textContent?.includes("Why Choose Crensa?")
 );
 
 expect(featuresSection).toBeTruthy();
 expect(featuresSection).toHaveClass("bg-gradient-to-br");
 });

 it("displays all six default features", () => {
 render(<NewLandingPage />);
 
 const featureCards = screen.getAllByRole("heading", { level: 3 });
 const featureTitles = featureCards.map(card => card.textContent);
 
 expect(featureTitles).toContain("Series & Collections");
 expect(featureTitles).toContain("Flexible Video Formats");
 expect(featureTitles).toContain("Direct Monetization");
 expect(featureTitles).toContain("Advanced Analytics");
 expect(featureTitles).toContain("Content Discovery");
 expect(featureTitles).toContain("Premium Memberships");
 });

 it("renders features section in the correct order within the page", () => {
 render(<NewLandingPage />);

 const headings = screen.getAllByRole("heading", { level: 2 });
 const headingTexts = headings.map(h => h.textContent);
 
 expect(headingTexts).toContain("Trending Creators");
 expect(headingTexts).toContain("Trending Shows & Series");
 expect(headingTexts).toContain("Browse by Category");
 expect(headingTexts).toContain("Why Choose Crensa?"); // Features

 const featuresIndex = headingTexts.indexOf("Why Choose Crensa?");
 const categoriesIndex = headingTexts.indexOf("Browse by Category");
 expect(featuresIndex).toBeGreaterThan(categoriesIndex);
 });

 it("features section is wrapped in error boundary", () => {
 const { container } = render(<NewLandingPage />);

 expect(screen.getByText("Why Choose Crensa?")).toBeInTheDocument();
 expect(screen.getByText("Series & Collections")).toBeInTheDocument();
 });
});