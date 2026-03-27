import React from 'react';
import ChartCard from './ChartCard';

const ChartsSection = ({ showToast }) => {
  const maizeData = {
    labels: ['2010',	'2011',	'2012',	'2013',	'2014',	'2015',	'2016',	'2017',	'2018',	'2019',	'2020',	'2021',	'2022',	'2023',	'2024'],
  
    datasets: [{
      label: 'Tonnes/ha',
      data: [1.72,	1.59,	1.73,	1.69,	1.66,	1.75,	1.42,	1.70,	1.87,	1.63,	1.66,	1.52,	1.45,	1.77,	1.67],
      borderColor: '#1f6e43',
      backgroundColor: 'rgba(31,110,67,0.1)',
      fill: true,
      tension: 0.3
    }]
  };

  const livestockData = {
    labels: ['Beef Cattle','Dairy Cattle', 'Meat Goat',  'Indegenous Chicken',  'Broilers', 'Layers'],
    datasets: [{
      label: 'Millions',
      data: [17.88, 5.48, 39.95, 63.41, 6.42, 7.21],
      backgroundColor: '#1f6e43',
      borderRadius: 8
    }]
  };

  const priceData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      label: 'Market Price INdex',
      data: [146.8, 147.0, 148.0, 148.9, 149.2],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.1)',
      fill: true,
      tension: 0.2
    }]
  };

  const handleExport = (chartId) => {
    let data = [];
    if (chartId === 'maizeChart') {
      data = [{ year: 2020, value: 3.2 }, { year: 2021, value: 3.5 }, { year: 2022, value: 3.8 }, { year: 2023, value: 3.4 }, { year: 2024, value: 4.1 }, { year: 2025, value: 4.5 }];
    } else if (chartId === 'livestockChart') {
      data = [{ species: "Cattle", millions: 21.5 }, { species: "Goats", millions: 28.3 }, { species: "Sheep", millions: 18.7 }, { species: "Poultry", millions: 52.4 }];
    } else {
      data = [{ month: "Jan", index: 102 }, { month: "Mar", index: 107 }, { month: "May", index: 110 }, { month: "Jul", index: 118 }, { month: "Sep", index: 124 }, { month: "Nov", index: 132 }];
    }
    
    const csv = Object.keys(data[0]).join(',') + '\n' + data.map(d => Object.values(d).join(',')).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilimostat_${chartId}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ ${chartId} data exported as CSV (FAIR compliant)`);
  };

  return (
    <section>
      <div className="container">
        <h2>📊 Agricultural Statistics Dashboard</h2>
        <p className="section-subhead">FAIR-compliant data from Kenya's agricultural sector</p>
        <div className="charts-grid">
          <ChartCard
            title="Maize Production Trends"
            chartId="maizeChart"
            type="line"
            data={maizeData}
            onExport={handleExport}
          />
          <ChartCard
            title="Livestock Population 2025"
            chartId="livestockChart"
            type="bar"
            data={livestockData}
            onExport={handleExport}
          />
          <ChartCard
            title="Consumer Price Index (CPI)"
            chartId="priceChart"
            type="line"
            data={priceData}
            onExport={handleExport}
          />
        </div>
      </div>
    </section>
  );
};

export default ChartsSection;