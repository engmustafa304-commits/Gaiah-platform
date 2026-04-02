import React from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Values from '../../components/Values';
import Services from '../../components/Services';
import FreeTrial from '../../components/FreeTrial';
import Designs from '../../components/Designs';
import Pricing from '../../components/Pricing';
import Supervisors from '../../components/Supervisors';
import SupervisorWork from '../../components/SupervisorWork';
import InvitationPricing from '../../components/InvitationPricing';
import ExclusiveService from '../../components/ExclusiveService';
import Footer from '../../components/Footer';

const Home = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Values />
        <Services />
        <FreeTrial />
        <Designs />
        <Pricing />
        <Supervisors />
        <SupervisorWork />
        <InvitationPricing />
        <ExclusiveService />
      </main>
      <Footer />
    </>
  );
};

export default Home;
