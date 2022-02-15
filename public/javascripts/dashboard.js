console.log("fonctionne");

const ctxChartCategories= document.getElementById("chartCategories");

fetch(window.location.href+"/chart/categories")
.then(response=>response.json())
.then(categories=>{
    const chartCategories= new Chart(ctxChartCategories, {
        type: 'pie',
        data: {
            labels: categories.map(cat=>cat.name),
            datasets: [{
                label: "categories",
                data: categories.map(cat=>cat.total),
                backgroundColor: categories.map(cat=>cat.color),
                hoverOffset: 4
            }]
        }
    });
})
