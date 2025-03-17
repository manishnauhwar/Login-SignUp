import React from 'react'
import './Pagetitle.css';

const Pagetitle = ({ page }) => {
  return (
    <div className="pagetitle">
      <h1>{page}</h1>
    </div >
  )
}

export default Pagetitle;