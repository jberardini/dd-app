var zoom = 17;
var layer = 'ortho';

// get tiles from user's current view
function fetchTileDataFromPlan(api, plan){
	var returned_tiles = api.Tiles.get({planId: plan.id, layerName: layer, zoom: zoom});
	return returned_tiles;
}

// create a new window that renders the tiles
function createPrintWindow(links) {
	var windowUrl = 'about:blank';
	var uniqueName = new Date();
	var windowName = 'Print' + uniqueName.getTime();
	var printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
	for (i=0; i<links.length; i++) {
		printWindow.document.write("<img src="+links[i]+" style='display: block;' }/>");
	}
	var sourceHTML = printWindow.document.body.innerHTML
	return sourceHTML;
}

// should save the content of the new windodw to PDF
// ran into an error that required a proxy, but wasn't able to figure out how to implement
function saveToPDF(sourceHTML) {
	html2canvas(sourceHTML, {
		onrendered: function(canvas) {         
	    var imgData = canvas.toDataURL(
	        'image/png');              
	    var doc = new jsPDF('p', 'mm');
	    doc.addImage(imgData, 'PNG', 10, 10);
	    doc.save('sample-file.pdf');
    }
  });
}

// uses promises to execute the process of retrieving tiles, adding them to a print window, and saving them to a pdf
function executeProcess() {
	new DroneDeploy({version: 1}).then(function(dronedeployApi){
   return dronedeployApi.Plans.getCurrentlyViewed().then(function(plan){
      return fetchTileDataFromPlan(dronedeployApi, plan);
   	});
		}).then(function(tileResponse){
			return tileResponse.tiles;
		}).then(function(links){
			return createPrintWindow(links);
		}).then(function(sourceHTML){
			return saveToPDF(sourceHTML);
		});
}


// onClick event
$(document).ready(function() {
	$('#print').on('click', executeProcess)
});



