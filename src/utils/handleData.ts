import {ProjectHooks} from '@gitbeaker/node'
import {html as format} from 'telegram-format';

export const handleGetProjectRes = async (response: any[]) => {

  let result = ''
  const results = response.map(ele => {
    result += `
      id: ${ele.id}
      projectName: ${ele.name}
      url: ${ele.web_url}
      createdAt: ${ele.created_at}
    `
    return `
      id: ${ele.id}
      projectName: ${ele.name}
      url: ${ele.web_url}
      createdAt: ${ele.created_at}
    `
  })
  return result

}

export const handlePayloadPushEvent = (payload: any) => {
  let result = ''
  result += `<b>${payload.user_name} has just pushed ${payload.total_commits_count} commits on ${payload.project.name} \n\n</b>`
  result += `Commits:`
  for (const rawCommit of payload.commits) {
    result += handleCommit(rawCommit)
    result += '\n'
  }

  result +=
    `Repository URL: ${payload.project.http_url}\nNamespace: ${payload.project.namespace}\nPush ref: ${payload.ref}
    `
  return result
}


export const handleMergeRequestEvent = (payload: any) => {
  let result = ''
  result += `<b>A merge request has been ${payload.object_attributes.state} by ${payload.user.name} \n\n</b>`
  result += `<pre>Affected branches: <b>${payload.object_attributes.source_branch} </b> is request merged into <b> ${payload.object_attributes.source_branch}</b> with latest commit at ${payload.object_attributes.last_commit.timestamp}\n</pre>`
  result +=
    `\nRepository URL: ${payload.project.http_url}\nNamespace: ${payload.project.namespace}
    `
  return result
}


function handleCommit(rawCommit: any) {
  let result = ''
  result +=
    `<pre>Commit by ${rawCommit.author.name}
URL:${rawCommit.url}
Title: ${rawCommit.title}
    (+) ${rawCommit.added.length} files added.
    (~) ${rawCommit.modified.length} files modified.
    (-) ${rawCommit.removed.length} files removed.
Commit was created at ${rawCommit.timestamp}
     </pre>`
  return result
}