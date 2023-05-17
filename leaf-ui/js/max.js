// $('#export-button').on('click', exportMaxAbsTime);
window.onload = function(){
  exportMaxAbsTime() ;
}
console.log('Max Absolute Time:');
$('#export-button').on('click', exportMaxAbsTime);
function exportMaxAbsTime() {
    var template = _.template($('#assignments-template').html());
    var maxAbsTime = $('#max-abs-time').val();
  
    // Use the exported `maxAbsTime` as needed
    console.log('Max Absolute Time:', maxAbsTime);
}
  
  