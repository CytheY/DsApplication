function removeItem(key){
	localStorage.removeItem(key);
	updateDeviceListContent();
}

function clearDeviceList(){
	localStorage.clear();
	updateDeviceListContent();
}

function addDevice(){
	var selectedName = $('#select-choice-min').find('option:selected').attr('id');
	var selectedSerial = $('#select-choice-min').find('option:selected').attr('data-serial');
	localStorage.setItem(selectedName,selectedSerial);
	updateDeviceListContent();
}

function addDevicePerName(name,serial){
	localStorage.setItem(name,serial);
	updateDeviceListContent();
}

function updateDeviceListContent(){
	var content = "";
	for (var i = 0; i < localStorage.length; i++){
	    content += "<li><a id='"+localStorage.key(i)+"' href='#"+localStorage.key(i)+"'>"+localStorage.key(i)+"</a><a href='#' data-icon='delete' onclick='removeItem(\""+localStorage.key(i)+"\")'>X</a></li>";
	}

	$('#list').html(content);
	$('#list').listview('refresh');
	
}