var results = db.study.find({}).toArray();
var toDiscard = [];
for (var i in results) {
	var counter = 0;
	var result = results[i];
	counter += result.learn_sliiks_needed < 3?1:0;
	counter += result.learn_new_skills < 3?1:0;
	counter += result.help_get_job < 3?1:0;
	counter += result.motivated < 3?1:0;
	counter += result.trust_learn_task < 3?1:0;
	counter += result.help_ong < 3?1:0;
	counter += result.learn_new_skills != 'Sí'?1:0;
	if (counter > 3) {
		var task = db.vol.findOne({'idmicro':result.task});
		toDiscard.push({id:result.task, skill:task.skill});
	}
}
var group = {};
for (var i in toDiscard) {
	var row = toDiscard[i];
	var id = row.id;
	if (group[id] == undefined) {
		group[id] = {skill:row.skill, count:1};
	} else {
		group[id].count++;
	}
}
for (var i in group) {
	db.vol.update({idmicro:parseInt(i)},{$set:{active:'0'}})
}
printjson(group);