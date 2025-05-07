import React from 'react'
import Header from '../components/header';
import ViewToggle from '../components/ViewToggle';
import ProjectTable from '../components/ProjectTable';

export default function Projects() {
  return (
    <div className="space-y-6">
      <Header />
      <ViewToggle />
      <ProjectTable />
    </div>
  );
}
