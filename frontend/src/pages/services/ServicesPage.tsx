import React from "react";
import ServicesSection from "./Services";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMetaTags } from "@/hooks/useMetaTags";

const ServicesPage: React.FC = () => {
    usePageTitle("Services");
    useMetaTags({
        title: "Services",
        description: "What I Can Do For You",
        keywords: "services, portfolio, software development, consulting",
        ogTitle: "Services",
        ogDescription: "What I Can Do For You",
        ogType: "website",
    });
    return (
        <>
            <ServicesSection />
        </>
    );
};

export default ServicesPage;
