import axios from 'axios'
import {BotService} from "@/services/BotService";
import {SubModel} from "@/models/sub.model";

export const gitLabWebhooks = async (req, res) => {
  const body = req.body;

  const subList = await SubModel.find({projectId: body.project.id}).exec();



  for (const subListElement of subList) {
    await BotService.sendNotification(body, subListElement.messageID)
  }
  if (body.object_kind === 'merge_request' && body.object_attributes.action === 'open') {
    await BotService.sendMergeRequestForSuperAdmin(body, process.env.SUPER_ADMIN)

  } else if (body.object_kind === 'merge_request' && (body.object_attributes.action === 'close' || body.object_attributes.action === 'merge')) {

    await BotService.deleteMergeRequestMessage(body, process.env.SUPER_ADMIN)
  }
  res.status(200).json({
    message: "Ok"
  })

}
