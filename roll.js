module.exports = class Roll{
    roll(i_command){
        var l_command_body = this.getCommandBody(i_command)
        var o_result_sum = 0
        
        var o_result_string = 0
        // o_result_string = "[ "
        for(var i = 0; i < this.getPrefix(l_command_body); i ++){
            var l_tmp = Math.round(Math.random() * (this.getSuffix(l_command_body) - 1) + 1)
            o_result_sum += l_tmp

            o_result_string += l_tmp 
                // + ', '
        }
        return o_result_string
        // return o_result_string.substr(0, o_result_string.length - 2) + " ] => " + o_result_sum
    }
    

    getCommandBody(i_command){
        return i_command.split(' ')[1]
    }

    getPrefix(i_command){
        return i_command.split('k')[0]
    }

    getSuffix(i_command){
        return parseInt(i_command.split('k')[1])
    }
}